const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las cuentas por cobrar
router.get('/', async (req, res) => {
  try {
    const { estado, cliente_id } = req.query;
    
    let query = `
      SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono,
             v.created_at as fecha_venta, u.nombre as vendedor_nombre
      FROM cuentas_por_cobrar c
      INNER JOIN clientes cl ON c.cliente_id = cl.id
      INNER JOIN ventas v ON c.venta_id = v.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }
    
    if (cliente_id) {
      query += ' AND c.cliente_id = ?';
      params.push(cliente_id);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const [cuentas] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: cuentas
    });
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cuentas'
    });
  }
});

// Obtener resumen de cuentas por cobrar
router.get('/resumen', async (req, res) => {
  try {
    const [resumen] = await pool.query(`
      SELECT 
        COUNT(*) as total_cuentas,
        SUM(monto_pendiente) as monto_total_pendiente,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as cuentas_pendientes,
        SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as cuentas_vencidas,
        SUM(CASE WHEN estado = 'pendiente' THEN monto_pendiente ELSE 0 END) as monto_pendiente,
        SUM(CASE WHEN estado = 'vencido' THEN monto_pendiente ELSE 0 END) as monto_vencido
      FROM cuentas_por_cobrar
      WHERE estado != 'pagado'
    `);
    
    res.json({
      success: true,
      data: resumen[0]
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen'
    });
  }
});

// Crear cuenta por cobrar (al hacer venta a crédito)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { cliente_id, venta_id, monto_total, fecha_vencimiento, notas } = req.body;
    
    if (!cliente_id || !venta_id || !monto_total) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }
    
    await connection.beginTransaction();
    
    // Crear cuenta por cobrar
    const [result] = await connection.query(
      `INSERT INTO cuentas_por_cobrar 
       (cliente_id, venta_id, monto_total, monto_pendiente, fecha_vencimiento, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_id, venta_id, monto_total, monto_total, fecha_vencimiento, notas]
    );
    
    // Actualizar venta como crédito
    await connection.query(
      'UPDATE ventas SET tipo_pago = "credito" WHERE id = ?',
      [venta_id]
    );
    
    await connection.commit();
    
    const [nuevaCuenta] = await connection.query(
      `SELECT c.*, cl.nombre as cliente_nombre
       FROM cuentas_por_cobrar c
       INNER JOIN clientes cl ON c.cliente_id = cl.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Cuenta por cobrar creada exitosamente',
      data: nuevaCuenta[0]
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear cuenta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear cuenta'
    });
  } finally {
    connection.release();
  }
});

// Registrar pago a cuenta
router.post('/:id/pagar', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { monto, metodo_pago, usuario_id, notas } = req.body;
    
    if (!monto || !usuario_id) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }
    
    await connection.beginTransaction();
    
    // Obtener cuenta actual
    const [cuenta] = await connection.query(
      'SELECT * FROM cuentas_por_cobrar WHERE id = ?',
      [req.params.id]
    );
    
    if (cuenta.length === 0) {
      throw new Error('Cuenta no encontrada');
    }
    
    const montoPago = parseFloat(monto);
    const montoPendiente = parseFloat(cuenta[0].monto_pendiente);
    
    if (montoPago > montoPendiente) {
      throw new Error('El monto del pago excede la deuda');
    }
    
    // Registrar pago
    await connection.query(
      `INSERT INTO pagos_cuenta (cuenta_id, monto, metodo_pago, usuario_id, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, montoPago, metodo_pago || 'efectivo', usuario_id, notas]
    );
    
    // Actualizar cuenta
    const nuevoMontoPagado = parseFloat(cuenta[0].monto_pagado) + montoPago;
    const nuevoMontoPendiente = montoPendiente - montoPago;
    const nuevoEstado = nuevoMontoPendiente <= 0 ? 'pagado' : cuenta[0].estado;
    
    await connection.query(
      `UPDATE cuentas_por_cobrar 
       SET monto_pagado = ?, monto_pendiente = ?, estado = ?
       WHERE id = ?`,
      [nuevoMontoPagado, nuevoMontoPendiente, nuevoEstado, req.params.id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        monto_pagado: nuevoMontoPagado,
        monto_pendiente: nuevoMontoPendiente,
        estado: nuevoEstado
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al registrar pago'
    });
  } finally {
    connection.release();
  }
});

// Obtener historial de pagos de una cuenta
router.get('/:id/pagos', async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.*, u.nombre as usuario_nombre
       FROM pagos_cuenta p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.cuenta_id = ?
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: pagos
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pagos'
    });
  }
});

// Obtener detalle de cuenta con venta
router.get('/:id/detalle', async (req, res) => {
  try {
    const [cuenta] = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono,
              v.total as venta_total, v.created_at as fecha_venta,
              u.nombre as vendedor_nombre
       FROM cuentas_por_cobrar c
       INNER JOIN clientes cl ON c.cliente_id = cl.id
       INNER JOIN ventas v ON c.venta_id = v.id
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    
    if (cuenta.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta no encontrada'
      });
    }
    
    // Obtener detalle de la venta
    const [detalleVenta] = await pool.query(
      `SELECT dv.*, p.nombre as producto_nombre
       FROM detalle_ventas dv
       INNER JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = ?`,
      [cuenta[0].venta_id]
    );
    
    // Obtener pagos
    const [pagos] = await pool.query(
      `SELECT p.*, u.nombre as usuario_nombre
       FROM pagos_cuenta p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.cuenta_id = ?
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...cuenta[0],
        productos: detalleVenta,
        pagos
      }
    });
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener detalle'
    });
  }
});

module.exports = router;
