const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT * FROM categorias ORDER BY nombre ASC'
    );
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías'
    });
  }
});

// Crear nueva categoría
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    
    const [nuevaCategoria] = await pool.query(
      'SELECT * FROM categorias WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: nuevaCategoria[0]
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear categoría'
    });
  }
});

module.exports = router;
