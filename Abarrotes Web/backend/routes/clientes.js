const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes WHERE activo = true ORDER BY nombre ASC'
    );
    
    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes'
    });
  }
});

// Obtener un cliente por ID con sus cuentas
router.get('/:id', async (req, res) => {
  try {
    const [cliente] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [req.params.id]
    );
    
    if (cliente.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Obtener cuentas del cliente
    const [cuentas] = await pool.query(
      `SELECT c.*, v.created_at as fecha_venta
       FROM cuentas_por_cobrar c
       INNER JOIN ventas v ON c.venta_id = v.id
       WHERE c.cliente_id = ?
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...cliente[0],
        cuentas
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cliente'
    });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, telefono, direccion) VALUES (?, ?, ?)',
      [nombre, telefono, direccion]
    );
    
    const [nuevoCliente] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: nuevoCliente[0]
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear cliente'
    });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    
    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, telefono, direccion, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    const [clienteActualizado] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar cliente'
    });
  }
});

// Eliminar cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE clientes SET activo = false WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cliente'
    });
  }
});

// Buscar cliente por nombre
router.get('/buscar/:nombre', async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes WHERE nombre LIKE ? AND activo = true LIMIT 10',
      [`%${req.params.nombre}%`]
    );
    
    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar clientes'
    });
  }
});

module.exports = router;
