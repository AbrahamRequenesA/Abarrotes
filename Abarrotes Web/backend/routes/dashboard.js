const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener estadísticas del dashboard
router.get('/estadisticas', async (req, res) => {
  try {
    // Total de productos
    const [totalProductos] = await pool.query(
      'SELECT COUNT(*) as total FROM productos WHERE activo = true'
    );
    
    // Ventas del día
    const [ventasHoy] = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as monto_total
      FROM ventas
      WHERE DATE(created_at) = CURDATE() AND estado = 'completada'
    `);
    
    // Ventas de ayer para comparación
    const [ventasAyer] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as monto_total
      FROM ventas
      WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND estado = 'completada'
    `);
    
    // Productos con stock bajo
    const [stockBajo] = await pool.query(
      'SELECT COUNT(*) as total FROM productos WHERE stock <= stock_minimo AND activo = true'
    );
    
    // Total proveedores activos
    const [totalProveedores] = await pool.query(
      'SELECT COUNT(*) as total FROM proveedores WHERE activo = true'
    );
    
    // Proveedores con actividad hoy
    const [proveedoresHoy] = await pool.query(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM proveedores p
      WHERE p.activo = true
    `);
    
    // Calcular porcentaje de cambio en ventas
    const montoHoy = parseFloat(ventasHoy[0].monto_total);
    const montoAyer = parseFloat(ventasAyer[0].monto_total);
    let cambioVentas = 0;
    
    if (montoAyer > 0) {
      cambioVentas = ((montoHoy - montoAyer) / montoAyer) * 100;
    }
    
    res.json({
      success: true,
      data: {
        totalProductos: totalProductos[0].total,
        ventasHoy: {
          cantidad: ventasHoy[0].total_ventas,
          monto: montoHoy,
          cambio: cambioVentas.toFixed(1)
        },
        stockBajo: stockBajo[0].total,
        proveedores: {
          total: totalProveedores[0].total,
          activosHoy: proveedoresHoy[0].total
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// Obtener productos con stock bajo
router.get('/stock-bajo', async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre,
             CASE 
               WHEN p.stock = 0 THEN 'critico'
               WHEN p.stock <= p.stock_minimo THEN 'critico'
               ELSE 'bajo'
             END as estado
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.stock <= p.stock_minimo * 1.5 AND p.activo = true
      ORDER BY p.stock ASC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos con stock bajo'
    });
  }
});

// Obtener ventas recientes
router.get('/ventas-recientes', async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT v.id, v.total, v.created_at,
             (SELECT GROUP_CONCAT(p.nombre SEPARATOR ', ')
              FROM detalle_ventas dv
              INNER JOIN productos p ON dv.producto_id = p.id
              WHERE dv.venta_id = v.id
              LIMIT 3) as productos,
             (SELECT SUM(cantidad) FROM detalle_ventas WHERE venta_id = v.id) as total_items
      FROM ventas v
      WHERE v.estado = 'completada'
      ORDER BY v.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    console.error('Error al obtener ventas recientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener ventas recientes'
    });
  }
});

// Obtener ventas por período
router.get('/ventas-periodo', async (req, res) => {
  try {
    const { dias = 7 } = req.query;
    
    const [ventas] = await pool.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as cantidad,
        SUM(total) as monto
      FROM ventas
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND estado = 'completada'
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `, [dias]);
    
    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    console.error('Error al obtener ventas por período:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener ventas por período'
    });
  }
});

module.exports = router;
