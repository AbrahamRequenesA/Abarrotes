const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, insertSampleData } = require('./config/database');

// Rutas
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const proveedoresRoutes = require('./routes/proveedores');
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const dashboardRoutes = require('./routes/dashboard');
const clientesRoutes = require('./routes/clientes');
const cuentasRoutes = require('./routes/cuentas');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cuentas', cuentasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Abarrotes funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      ventas: '/api/ventas',
      proveedores: '/api/proveedores',
      usuarios: '/api/usuarios',
      categorias: '/api/categorias',
      dashboard: '/api/dashboard'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: err.message 
  });
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    await initDatabase();
    await insertSampleData();
    
    app.listen(PORT, () => {
      console.log("Servidor escuchando en todas las interfaces IPv4 e IPv6");
      console.log(`\n🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log(`📊 API disponible en http://0.0.0.0:${PORT}/api`);
      console.log(`\n📝 Credenciales de prueba:`);
      console.log(`   Admin: admin@abarrotes.com / admin123`);
      console.log(`   Vendedor: vendedor@abarrotes.com / admin123\n`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

const listRoutes = (path, layer) => {
  if (layer.route) {
    layer.route.stack.forEach(routeLayer => {
      console.log(`${Object.keys(routeLayer.method)} ${path}${layer.route.path}`);
    });
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(inner => {
      listRoutes(path + (layer.regexp?.source.replace("^\\/", "/").replace("\\/?(?=\\/|$)", "") || ""), inner);
    });
  }
};

console.log("📌 Rutas registradas:");
app._router.stack.forEach(layer => listRoutes("", layer));

startServer();
