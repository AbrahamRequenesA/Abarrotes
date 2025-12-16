-- ============================================
-- SCRIPT DE BASE DE DATOS - SISTEMA ABARROTES
-- ============================================
-- Ejecuta este script si prefieres crear la base de datos manualmente
-- o si tienes problemas con la creación automática

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS abarrotes_db;
USE abarrotes_db;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'vendedor') NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria_id INT,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  precio DECIMAL(10, 2) NOT NULL,
  codigo_barras VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_nombre (nombre),
  INDEX idx_categoria (categoria_id),
  INDEX idx_codigo_barras (codigo_barras),
  INDEX idx_stock (stock)
);

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- ============================================
-- TABLA: ventas
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
  estado ENUM('completada', 'cancelada') DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (created_at),
  INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: detalle_ventas
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  INDEX idx_venta (venta_id),
  INDEX idx_producto (producto_id)
);

-- ============================================
-- TABLA: movimientos_inventario
-- ============================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  cantidad INT NOT NULL,
  motivo VARCHAR(200),
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_producto (producto_id),
  INDEX idx_tipo (tipo),
  INDEX idx_fecha (created_at)
);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar usuarios (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'admin'),
('Vendedor 1', 'vendedor@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'vendedor');

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES 
('Granos', 'Arroz, frijol, lentejas'),
('Aceites', 'Aceites vegetales y de cocina'),
('Lácteos', 'Leche, yogurt, queso'),
('Panadería', 'Pan, galletas, pasteles'),
('Endulzantes', 'Azúcar, miel, edulcorantes'),
('Bebidas', 'Refrescos, jugos, agua'),
('Enlatados', 'Conservas y productos enlatados'),
('Limpieza', 'Productos de limpieza del hogar');

-- Insertar productos
INSERT INTO productos (nombre, categoria_id, stock, stock_minimo, precio, codigo_barras) VALUES 
('Arroz Diana 500g', 1, 150, 50, 2500.00, '7702001234567'),
('Aceite Gourmet 1L', 2, 25, 30, 8900.00, '7702001234568'),
('Leche Alpina 1L', 3, 5, 20, 4200.00, '7702001234569'),
('Pan Bimbo Tajado', 4, 80, 25, 3500.00, '7702001234570'),
('Azúcar San Luis 1kg', 5, 200, 75, 3200.00, '7702001234571'),
('Coca-Cola 2L', 6, 45, 30, 5500.00, '7702001234572'),
('Atún Van Camps', 7, 60, 20, 4800.00, '7702001234573'),
('Fabuloso 1L', 8, 35, 15, 6200.00, '7702001234574');

-- Insertar proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES 
('Distribuidora Nacional', 'Carlos López', '3001234567', 'contacto@distnacional.com', 'Calle 10 #20-30'),
('Alimentos del Valle', 'María González', '3109876543', 'ventas@alimentosvalle.com', 'Carrera 15 #45-20'),
('Lácteos Frescos SAS', 'Pedro Ramírez', '3201122334', 'info@lactesfrescos.com', 'Avenida 5 #12-45');

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver todos los productos
-- SELECT * FROM productos;

-- Ver productos con stock bajo
-- SELECT * FROM productos WHERE stock <= stock_minimo;

-- Ver ventas del día
-- SELECT * FROM ventas WHERE DATE(created_at) = CURDATE();

-- Ver estadísticas de ventas
-- SELECT 
--   COUNT(*) as total_ventas,
--   SUM(total) as monto_total,
--   AVG(total) as ticket_promedio
-- FROM ventas 
-- WHERE DATE(created_at) = CURDATE() AND estado = 'completada';

-- Ver productos más vendidos
-- SELECT 
--   p.nombre,
--   SUM(dv.cantidad) as cantidad_vendida,
--   SUM(dv.subtotal) as total_vendido
-- FROM detalle_ventas dv
-- INNER JOIN productos p ON dv.producto_id = p.id
-- GROUP BY p.id, p.nombre
-- ORDER BY cantidad_vendida DESC
-- LIMIT 10;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Base de datos creada exitosamente!' as mensaje;
