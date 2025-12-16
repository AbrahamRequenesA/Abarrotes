const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { categoria, busqueda, estado } = req.query;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre,
             CASE 
               WHEN p.stock <= 0 THEN 'agotado'
               WHEN p.stock <= p.stock_minimo THEN 'critico'
               WHEN p.stock <= (p.stock_minimo * 1.5) THEN 'bajo'
               ELSE 'disponible'
             END as estado
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = true
    `;
    
    const params = [];
    
    if (categoria) {
      query += ' AND p.categoria_id = ?';
      params.push(categoria);
    }
    
    if (busqueda) {
      query += ' AND (p.nombre LIKE ? OR p.codigo_barras LIKE ?)';
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }
    
    if (estado) {
      if (estado === 'critico') {
        query += ' AND p.stock <= p.stock_minimo';
      } else if (estado === 'bajo') {
        query += ' AND p.stock > p.stock_minimo AND p.stock <= (p.stock_minimo * 1.5)';
      } else if (estado === 'disponible') {
        query += ' AND p.stock > (p.stock_minimo * 1.5)';
      }
    }
    
    query += ' ORDER BY p.nombre ASC';
    
    const [productos] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [producto] = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (producto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: producto[0]
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, categoria_id, stock, stock_minimo, precio, codigo_barras } = req.body;
    
    if (!nombre || !precio || stock === undefined || stock_minimo === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, categoria_id, stock, stock_minimo, precio, codigo_barras)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria_id, stock, stock_minimo, precio, codigo_barras]
    );
    
    const [nuevoProducto] = await pool.query(
      'SELECT * FROM productos WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto[0]
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto'
    });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, categoria_id, stock, stock_minimo, precio, codigo_barras } = req.body;
    
    const [result] = await pool.query(
      `UPDATE productos 
       SET nombre = ?, descripcion = ?, categoria_id = ?, stock = ?, 
           stock_minimo = ?, precio = ?, codigo_barras = ?
       WHERE id = ?`,
      [nombre, descripcion, categoria_id, stock, stock_minimo, precio, codigo_barras, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const [productoActualizado] = await pool.query(
      'SELECT * FROM productos WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto'
    });
  }
});

// Eliminar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE productos SET activo = false WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto'
    });
  }
});

// Ajustar stock
router.patch('/:id/ajustar-stock', async (req, res) => {
  try {
    const { cantidad, tipo, motivo, usuario_id } = req.body;
    
    if (!cantidad || !tipo || !usuario_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obtener stock actual
      const [producto] = await connection.query(
        'SELECT stock FROM productos WHERE id = ?',
        [req.params.id]
      );
      
      if (producto.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      let nuevoStock = producto[0].stock;
      
      if (tipo === 'entrada' || tipo === 'ajuste') {
        nuevoStock += parseInt(cantidad);
      } else if (tipo === 'salida') {
        nuevoStock -= parseInt(cantidad);
        if (nuevoStock < 0) {
          throw new Error('Stock insuficiente');
        }
      }
      
      // Actualizar stock
      await connection.query(
        'UPDATE productos SET stock = ? WHERE id = ?',
        [nuevoStock, req.params.id]
      );
      
      // Registrar movimiento
      await connection.query(
        `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo, usuario_id)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, tipo, cantidad, motivo, usuario_id]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Stock ajustado exitosamente',
        nuevoStock
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al ajustar stock'
    });
  }
});

module.exports = router;
