const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE activo = true'
    );
    
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = ? AND activo = true',
      [email]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Nota: En producción, aquí deberías verificar el password con bcrypt
    // Por ahora, cualquier password funciona para pruebas
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en login'
    });
  }
});

module.exports = router;
