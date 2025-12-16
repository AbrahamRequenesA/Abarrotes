const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'abarrotes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'vendedor') NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de categorías
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de productos
    await connection.query(`
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
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
      )
    `);

    // Crear tabla de proveedores
    await connection.query(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        contacto VARCHAR(100),
        telefono VARCHAR(20),
        email VARCHAR(100),
        direccion TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de ventas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
        estado ENUM('completada', 'cancelada') DEFAULT 'completada',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla de detalle de ventas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venta_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Crear tabla de movimientos de inventario
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
        cantidad INT NOT NULL,
        motivo VARCHAR(200),
        usuario_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('✅ Base de datos inicializada correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Función para insertar datos de ejemplo
const insertSampleData = async () => {
  try {
    const connection = await pool.getConnection();

    // Verificar si ya hay datos
    const [usuarios] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
    if (usuarios[0].count > 0) {
      console.log('Los datos de ejemplo ya existen');
      connection.release();
      return;
    }

    // Insertar usuario administrador (password: admin123)
    await connection.query(`
      INSERT INTO usuarios (nombre, email, password, rol) VALUES 
      ('Administrador', 'admin@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'admin'),
      ('Vendedor 1', 'vendedor@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'vendedor')
    `);

    // Insertar categorías
    await connection.query(`
      INSERT INTO categorias (nombre, descripcion) VALUES 
      ('Granos', 'Arroz, frijol, lentejas'),
      ('Aceites', 'Aceites vegetales y de cocina'),
      ('Lácteos', 'Leche, yogurt, queso'),
      ('Panadería', 'Pan, galletas, pasteles'),
      ('Endulzantes', 'Azúcar, miel, edulcorantes'),
      ('Bebidas', 'Refrescos, jugos, agua'),
      ('Enlatados', 'Conservas y productos enlatados'),
      ('Limpieza', 'Productos de limpieza del hogar')
    `);

    // Insertar productos
    await connection.query(`
      INSERT INTO productos (nombre, categoria_id, stock, stock_minimo, precio, codigo_barras) VALUES 
      ('Arroz Diana 500g', 1, 150, 50, 2500, '7702001234567'),
      ('Aceite Gourmet 1L', 2, 25, 30, 8900, '7702001234568'),
      ('Leche Alpina 1L', 3, 5, 20, 4200, '7702001234569'),
      ('Pan Bimbo Tajado', 4, 80, 25, 3500, '7702001234570'),
      ('Azúcar San Luis 1kg', 5, 200, 75, 3200, '7702001234571'),
      ('Coca-Cola 2L', 6, 45, 30, 5500, '7702001234572'),
      ('Atún Van Camps', 7, 60, 20, 4800, '7702001234573'),
      ('Fabuloso 1L', 8, 35, 15, 6200, '7702001234574')
    `);

    // Insertar proveedores
    await connection.query(`
      INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES 
      ('Distribuidora Nacional', 'Carlos López', '3001234567', 'contacto@distnacional.com', 'Calle 10 #20-30'),
      ('Alimentos del Valle', 'María González', '3109876543', 'ventas@alimentosvalle.com', 'Carrera 15 #45-20'),
      ('Lácteos Frescos SAS', 'Pedro Ramírez', '3201122334', 'info@lactesfrescos.com', 'Avenida 5 #12-45')
    `);

    console.log('✅ Datos de ejemplo insertados correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase, insertSampleData };
