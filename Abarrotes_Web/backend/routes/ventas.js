const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado, usuario_id } = req.query;
    
    let query = `
      SELECT v.*, u.nombre as vendedor_nombre,
             (SELECT COUNT(*) FROM detalle_ventas WHERE venta_id = v.id) as total_items
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(v.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(v.created_at) <= ?';
      params.push(fecha_fin);
    }
    
    if (estado) {
      query += ' AND v.estado = ?';
      params.push(estado);
    }
    
    if (usuario_id) {
      query += ' AND v.usuario_id = ?';
      params.push(usuario_id);
    }
    
    query += ' ORDER BY v.created_at DESC';
    
    const [ventas] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener ventas'
    });
  }
});

// Obtener detalle de una venta
router.get('/:id', async (req, res) => {
  try {
    const [venta] = await pool.query(
      `SELECT v.*, u.nombre as vendedor_nombre, u.email as vendedor_email
       FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.id = ?`,
      [req.params.id]
    );
    
    if (venta.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }
    
    const [detalle] = await pool.query(
      `SELECT dv.*, p.nombre as producto_nombre, p.codigo_barras
       FROM detalle_ventas dv
       LEFT JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = ?`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...venta[0],
        detalle
      }
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener venta'
    });
  }
});

// Crear nueva venta
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { usuario_id, items, metodo_pago } = req.body;
    
    if (!usuario_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos'
      });
    }
    
    await connection.beginTransaction();
    
    // Calcular total
    let total = 0;
    for (const item of items) {
      total += item.precio * item.cantidad;
    }
    
    // Crear venta
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (usuario_id, total, metodo_pago)
       VALUES (?, ?, ?)`,
      [usuario_id, total, metodo_pago || 'efectivo']
    );
    
    const ventaId = ventaResult.insertId;
    
    // Insertar detalle y actualizar stock
    for (const item of items) {
      // Verificar stock disponible
      const [producto] = await connection.query(
        'SELECT stock FROM productos WHERE id = ?',
        [item.id]
      );
      
      if (producto.length === 0) {
        throw new Error(`Producto ${item.id} no encontrado`);
      }
      
      if (producto[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.nombre}`);
      }
      
      // Insertar detalle
      await connection.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [ventaId, item.id, item.cantidad, item.precio, item.precio * item.cantidad]
      );
      
      // Actualizar stock
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.id]
      );
      
      // Registrar movimiento de inventario
      await connection.query(
        `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo, usuario_id)
         VALUES (?, 'salida', ?, 'Venta', ?)`,
        [item.id, item.cantidad, usuario_id]
      );
    }
    
    await connection.commit();
    
    // Obtener la venta completa
    const [nuevaVenta] = await connection.query(
      `SELECT v.*, u.nombre as vendedor_nombre
       FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.id = ?`,
      [ventaId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Venta procesada exitosamente',
      data: nuevaVenta[0]
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar venta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar venta'
    });
  } finally {
    connection.release();
  }
});

// Cancelar venta
router.patch('/:id/cancelar', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtener detalle de la venta
    const [detalle] = await connection.query(
      'SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = ?',
      [req.params.id]
    );
    
    // Devolver stock
    for (const item of detalle) {
      await connection.query(
        'UPDATE productos SET stock = stock + ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }
    
    // Actualizar estado de venta
    await connection.query(
      'UPDATE ventas SET estado = "cancelada" WHERE id = ?',
      [req.params.id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Venta cancelada exitosamente'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar venta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar venta'
    });
  } finally {
    connection.release();
  }
});

// Obtener ventas del día
router.get('/resumen/hoy', async (req, res) => {
  try {
    const [resultado] = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as monto_total,
        COALESCE(AVG(total), 0) as ticket_promedio
      FROM ventas
      WHERE DATE(created_at) = CURDATE() AND estado = 'completada'
    `);
    
    res.json({
      success: true,
      data: resultado[0]
    });
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de ventas'
    });
  }
});

// Obtener productos más vendidos
router.get('/estadisticas/productos-mas-vendidos', async (req, res) => {
  try {
    const { limite = 10, fecha_inicio, fecha_fin } = req.query;
    
    let query = `
      SELECT 
        p.id, p.nombre, p.precio,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.subtotal) as total_vendido
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      INNER JOIN ventas v ON dv.venta_id = v.id
      WHERE v.estado = 'completada'
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(v.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(v.created_at) <= ?';
      params.push(fecha_fin);
    }
    
    query += `
      GROUP BY p.id, p.nombre, p.precio
      ORDER BY cantidad_vendida DESC
      LIMIT ?
    `;
    
    params.push(parseInt(limite));
    
    const [productos] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos más vendidos'
    });
  }
});

module.exports = router;
