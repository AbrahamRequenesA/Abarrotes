const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const [proveedores] = await pool.query(
      'SELECT * FROM proveedores WHERE activo = true ORDER BY nombre ASC'
    );
    
    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener proveedores'
    });
  }
});

// Obtener un proveedor por ID
router.get('/:id', async (req, res) => {
  try {
    const [proveedor] = await pool.query(
      'SELECT * FROM proveedores WHERE id = ?',
      [req.params.id]
    );
    
    if (proveedor.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: proveedor[0]
    });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener proveedor'
    });
  }
});

// Crear nuevo proveedor
router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, contacto, telefono, email, direccion]
    );
    
    const [nuevoProveedor] = await pool.query(
      'SELECT * FROM proveedores WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: nuevoProveedor[0]
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear proveedor'
    });
  }
});

// Actualizar proveedor
router.put('/:id', async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    
    const [result] = await pool.query(
      `UPDATE proveedores 
       SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ?
       WHERE id = ?`,
      [nombre, contacto, telefono, email, direccion, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }
    
    const [proveedorActualizado] = await pool.query(
      'SELECT * FROM proveedores WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: proveedorActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar proveedor'
    });
  }
});

// Eliminar proveedor (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE proveedores SET activo = false WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar proveedor'
    });
  }
});

module.exports = router;
