import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,       // <-- Advertencia: sin usar
  Download,     // <-- Advertencia: sin usar
  AlertTriangle,
  TrendingUp,
  UserCheck,
  ShoppingBag,
  LogOut,
  RefreshCw
} from 'lucide-react';
import './App.css';

// Configuración de la API
const API_URL = 'http://localhost:5000/api';

const App = () => {
  // ----------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para datos de la API
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);

  // Estados para el Modal de Crédito
  const [showCreditoModal, setShowCreditoModal] = useState(false);
  const [clienteBusqueda, setClienteBusqueda] = useState("");

  // ----------------------------------------------------
  // USE EFFECT (CARGA DE DATOS)
  // ----------------------------------------------------
  useEffect(() => {
    if (userRole) {
      cargarProductos();
      cargarCategorias();
      if (userRole === 'admin') {
        cargarEstadisticas();
        cargarProveedores();
        cargarProductosStockBajo();
        cargarVentasRecientes();
        cargarCuentasPorCobrar();
        cargarClientes(); // El admin también necesita los clientes
      }
      if (userRole === 'vendedor') {
        cargarClientes();
      }
    }
    // Añadimos 'userRole' como dependencia
  }, [userRole]);

  // ----------------------------------------------------
  // FUNCIONES DE API (CARGA DE DATOS)
  // ----------------------------------------------------
  const cargarProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      if (data.success) {
        setProductos(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);
      const data = await response.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores`);
      const data = await response.json();
      if (data.success) {
        setProveedores(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/estadisticas`);
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarProductosStockBajo = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stock-bajo`);
      const data = await response.json();
      if (data.success) {
        setProductosStockBajo(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos con stock bajo:', error);
    }
  };

  const cargarVentasRecientes = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/ventas-recientes`);
      const data = await response.json();
      if (data.success) {
        setVentasRecientes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ventas recientes:', error);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      const data = await response.json();
      if (data.success) {
        setClientes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const cargarCuentasPorCobrar = async () => {
    try {
      const response = await fetch(`${API_URL}/cuentas?estado=pendiente`);
      const data = await response.json();
      if (data.success) {
        setCuentasPorCobrar(data.data);
      }
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  // ----------------------------------------------------
  // FUNCIONES DE ACCIONES
  // ----------------------------------------------------

  // Procesar Venta Contado
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: userId,
          items: carrito,
          metodo_pago: 'efectivo'
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('¡Venta procesada exitosamente!');
        setCarrito([]);
        cargarProductos(); // Recargar productos para actualizar stock
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  // NUEVA: Procesar Venta a Crédito
  const procesarVentaCredito = async (clienteId) => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    setLoading(true);
    let ventaId; // Para guardar el ID de la venta
  
    try {
      // --- PASO 1: Crear la Venta (similar a procesarVenta) ---
      const ventaResponse = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          items: carrito,
          metodo_pago: 'credito' // <-- IMPORTANTE: Marcar como crédito
        }),
      });
  
      const ventaData = await ventaResponse.json();
  
      if (!ventaData.success) {
        throw new Error(ventaData.error || 'Error al crear la venta');
      }
  
      ventaId = ventaData.data.id; 
      const montoTotal = calcularTotal();
  
      // --- PASO 2: Crear la Cuenta por Cobrar ---
      const cuentaResponse = await fetch(`${API_URL}/cuentas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          venta_id: ventaId,
          monto_total: montoTotal
        }),
      });
  
      const cuentaData = await cuentaResponse.json();
  
      if (!cuentaData.success) {
        throw new Error(cuentaData.error || 'Error al crear la cuenta por cobrar');
      }
  
      // --- ÉXITO ---
      alert('¡Venta a crédito registrada exitosamente!');
      setCarrito([]);
      setShowCreditoModal(false);
      setClienteBusqueda("");
      cargarProductos(); // Actualizar stock
      if (userRole === 'admin') {
        cargarCuentasPorCobrar();
      }
  
    } catch (error) {
      console.error('Error al procesar venta a crédito:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // NUEVA: Crear Cliente desde Modal
  const crearYSeleccionarCliente = async (nombre, telefono) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, direccion: '' })
      });
      const data = await response.json();
      
      if (data.success) {
        const nuevoCliente = data.data;
        cargarClientes(); // Recargar la lista de clientes
        alert(`Cliente "${nuevoCliente.nombre}" creado. Procesando venta...`);
        await procesarVentaCredito(nuevoCliente.id); 
      } else {
        alert('Error al crear cliente: ' + data.error);
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      alert('Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  // NUEVA: Registrar Pago (Abono o Liquidación)
  const registrarPago = async (cuentaId, montoAPagar, montoPendiente) => {
    if (!montoAPagar || montoAPagar <= 0) {
      alert("El monto debe ser mayor a cero");
      return;
    }
  
    const montoFloat = parseFloat(montoAPagar);
    if (montoFloat > parseFloat(montoPendiente)) {
      alert("El monto a pagar no puede ser mayor que el monto pendiente.");
      return;
    }
  
    const isLiquidacion = montoFloat === parseFloat(montoPendiente);
    const confirmMsg = isLiquidacion
      ? `¿Estás seguro de LIQUIDAR esta cuenta por $${montoFloat.toLocaleString()}?`
      : `¿Estás seguro de ABONAR $${montoFloat.toLocaleString()} a esta cuenta?`;
  
    if (!window.confirm(confirmMsg)) {
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cuentas/${cuentaId}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: montoFloat,
          usuario_id: userId,
          metodo_pago: 'efectivo'
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        alert('Pago registrado exitosamente');
        cargarCuentasPorCobrar(); // Recargar las cuentas
      } else {
        alert('Error al registrar pago: ' + data.error);
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Producto
  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Producto eliminado exitosamente');
        cargarProductos();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    setUserRole(null);
    setUserId(null);
    setActiveTab('dashboard');
    setCarrito([]);
  };

  // ----------------------------------------------------
  // FUNCIONES DEL CARRITO
  // ----------------------------------------------------
  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const removerDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      removerDelCarrito(productoId);
    } else {
      setCarrito(carrito.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------

  // Si no hay usuario logueado, mostrar pantalla de login
  if (!userRole) {
    return <LoginScreen setUserRole={setUserRole} setUserId={setUserId} setActiveTab={setActiveTab} />;
  }

  // Renderizar la aplicación según el tipo de usuario
  return (
    <div className="bg-gray-50 min-h-screen">
      {userRole === 'admin' ? <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} estadisticas={estadisticas} cerrarSesion={cerrarSesion} /> : <VendedorNavigation activeTab={activeTab} setActiveTab={setActiveTab} cerrarSesion={cerrarSesion} />}
      
      <Header activeTab={activeTab} userRole={userRole} cargarProductos={cargarProductos} estadisticas={estadisticas} />

      {/* Rutas del Administrador */}
      {userRole === 'admin' && (
        <>
          {activeTab === 'dashboard' && <Dashboard estadisticas={estadisticas} productosStockBajo={productosStockBajo} ventasRecientes={ventasRecientes} />}
          {activeTab === 'productos' && <Productos productos={productos} cargarProductos={cargarProductos} eliminarProducto={eliminarProducto} categorias={categorias} />}
          
          {/* --- CORRECCIÓN APLICADA --- */}
          {activeTab === 'ventas' && <Ventas />}
          {activeTab === 'proveedores' && <Proveedores />}
          
          {/* Esta es la nueva sección que agregamos */}
          {activeTab === 'cuentas' && 
            <CuentasPorCobrarComponent 
              cuentas={cuentasPorCobrar} 
              onPagar={registrarPago}
              userId={userId}
            />
          } 
          {/*activeTab === 'configuracion' && <OtrasSecciones titulo="Configuración del Sistema" />*/}
        </>
      )}

      {/* Rutas del Vendedor */}
      {userRole === 'vendedor' && (
        <>
          {activeTab === 'nueva-venta' && <NuevaVenta 
              productos={productos} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              carrito={carrito} 
              agregarAlCarrito={agregarAlCarrito}
              removerDelCarrito={removerDelCarrito}
              actualizarCantidad={actualizarCantidad}
              calcularTotal={calcularTotal}
              procesarVenta={procesarVenta}
              loading={loading}
              // Props para el botón de crédito
              setShowCreditoModal={setShowCreditoModal}
          />}
          {activeTab === 'productos-vendedor' && <ProductosVendedor productos={productos} />}
        </>
      )}

      {/* ---- MODAL DE CRÉDITO (RENDERIZADO AQUÍ) ---- */}
      <ModalCredito
        show={showCreditoModal}
        onClose={() => setShowCreditoModal(false)}
        clientes={clientes}
        busqueda={clienteBusqueda}
        onBusquedaChange={setClienteBusqueda}
        onClienteSelect={(cliente) => {
          // Si selecciona un cliente, procesamos la venta
          procesarVentaCredito(cliente.id);
        }}
        onCrearCliente={crearYSeleccionarCliente}
        loading={loading}
      />
    </div>
  );
}; // <--- FIN DEL COMPONENTE APP

// ----------------------------------------------------------
// COMPONENTES ADICIONALES
// (Definidos FUERA de App para evitar errores de Hooks)
// ----------------------------------------------------------

// Pantalla de Login
const LoginScreen = ({ setUserRole, setUserId, setActiveTab }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-sm border w-96">
      <div className="text-center mb-8">
        <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Abarrotes</h1>
        <p className="text-gray-600 mt-2">Sistema de Inventarios</p>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Selecciona tu tipo de usuario
      </h2>
      <div className="space-y-4">
        <button
          onClick={() => {
            setUserRole('admin');
            setUserId(1); // ID del admin en la BD
            setActiveTab('dashboard');
          }}
          className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserCheck className="w-6 h-6 mr-3" />
          Administrador
        </button>
        <button
          onClick={() => {
            setUserRole('vendedor');
            setUserId(2); // ID del vendedor en la BD
            setActiveTab('nueva-venta');
          }}
          className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ShoppingBag className="w-6 h-6 mr-3" />
          Vendedor
        </button>
      </div>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          <strong>Administrador:</strong> Acceso completo al sistema<br />
          <strong>Vendedor:</strong> Solo ventas y consulta de productos
        </p>
      </div>
    </div>
  </div>
);

// Navegación para Administrador
const AdminNavigation = ({ activeTab, setActiveTab, estadisticas, cerrarSesion }) => (
  <div className="w-64 bg-slate-800 text-white h-screen fixed left-0 top-0">
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-400">Abarrotes</h1>
      <p className="text-sm text-slate-300 mt-1">Administrador</p>
    </div>
    <nav className="mt-6">
      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MENÚ PRINCIPAL</p>
      </div>
      {[
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'productos', label: 'Productos', icon: Package },
        { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
        { id: 'cuentas', label: 'Cuentas por Cobrar', icon: ShoppingCart },
        { id: 'proveedores', label: 'Proveedores', icon: Users },
       // { id: 'configuracion', label: 'Configuración', icon: Settings }
      ].map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors text-white ${
              activeTab === item.id ? 'bg-blue-600 border-r-4 border-blue-400' : ""
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        );
      })}
    </nav>
    <div className="absolute bottom-6 left-6 right-6">
      {estadisticas && estadisticas.stockBajo > 0 && (
        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-sm font-semibold">Stock Bajo</span>
          </div>
          <p className="text-xs text-slate-300">{estadisticas.stockBajo} productos necesitan reposición</p>
        </div>
      )}
      <button
        onClick={cerrarSesion}
        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar Sesión
      </button>
    </div>
  </div>
);

// Navegación para Vendedor
const VendedorNavigation = ({ activeTab, setActiveTab, cerrarSesion }) => (
  <div className="w-64 bg-green-800 text-white h-screen fixed left-0 top-0">
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-400">Abarrotes</h1>
      <p className="text-sm text-green-300 mt-1">Vendedor</p>
    </div>
    <nav className="mt-6">
      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">MENÚ VENDEDOR</p>
      </div>
      {[
        { id: 'nueva-venta', label: 'Nueva Venta', icon: ShoppingCart },
        { id: 'productos-vendedor', label: 'Ver Productos', icon: Package }
      ].map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-green-700 transition-colors text-white ${
              activeTab === item.id ? 'bg-green-600 border-r-4 border-green-400' : ""
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        );
      })}
    </nav>
    <div className="absolute bottom-6 left-6 right-6">
      <button
        onClick={cerrarSesion}
        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar Sesión
      </button>
    </div>
  </div>
);

// Encabezado
const Header = ({ activeTab, userRole, cargarProductos, estadisticas }) => (
  <div className="bg-white shadow-sm border-b ml-64 px-6 py-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'productos' && 'Gestión de Productos'}
          {activeTab === 'ventas' && 'Registro de Ventas'}
          {activeTab === 'cuentas' && 'Cuentas por Cobrar'}
          {activeTab === 'proveedores' && 'Proveedores'}
          {activeTab === 'configuracion' && 'Configuración'}
          {activeTab === 'nueva-venta' && 'Nueva Venta'}
          {activeTab === 'productos-vendedor' && 'Productos Disponibles'}
        </h2>
        {userRole && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            userRole === 'admin'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
            }`}>
            {userRole === 'admin' ? 'Administrador' : 'Vendedor'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={cargarProductos}
          className="p-2 text-gray-600 hover:text-gray-800"
          title="Actualizar datos"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        {userRole === 'admin' && estadisticas && (
          <button className="p-2 text-gray-600 hover:text-gray-800 relative">
            <Bell className="w-6 h-6" />
            {estadisticas.stockBajo > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {estadisticas.stockBajo}
              </span>
            )}
          </button>
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          userRole === 'admin' ? 'bg-blue-600' : 'bg-green-600'
          }`}>
          <span className="text-white text-sm font-semibold">
            {userRole === 'admin' ? 'A' : 'V'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Nueva Venta - Solo para vendedores
const NuevaVenta = ({ 
  productos, 
  searchTerm, 
  setSearchTerm, 
  carrito, 
  agregarAlCarrito, 
  removerDelCarrito, 
  actualizarCantidad, 
  calcularTotal, 
  procesarVenta, 
  loading,
  setShowCreditoModal 
}) => {
  
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Productos Disponibles ({productosFiltrados.length})</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productosFiltrados.map(producto => (
                <div key={producto.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{producto.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      producto.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                      producto.estado === 'bajo' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                      }`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{producto.categoria_nombre || 'Sin categoría'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      ${parseFloat(producto.precio).toLocaleString()}
                    </span>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={producto.stock === 0}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Carrito de Compras */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Carrito de Venta</h3>
          </div>
          <div className="p-6">
            {carrito.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no hay productos
              </p>
            ) : (
              <div className="space-y-4">
                {carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nombre}</p>
                      <p className="text-xs text-gray-600">${parseFloat(item.precio).toLocaleString()} c/u</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock}
                        className="w-6 h-6 bg-gray-200 rounded text-sm disabled:opacity-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removerDelCarrito(item.id)}
                        className="text-red-600 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${calcularTotal().toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={procesarVenta}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
                  >
                    {loading ? 'Procesando...' : 'Procesar Venta'}
                  </button>
                  
                  {/* ---- BOTÓN "PEDIR FIADO" CORREGIDO ---- */}
                  <button
                    onClick={() => setShowCreditoModal(true)}
                    disabled={loading || carrito.length === 0}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-semibold disabled:bg-gray-400 mt-2"
                  >
                    Pedir Fiado (Pagar Después)
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Productos para Vendedor (solo consulta)
const ProductosVendedor = ({ productos }) => (
  <div className="ml-64 p-6 bg-gray-50 min-h-screen">
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Consulta de Productos ({productos.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map(producto => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{producto.nombre}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria_nombre || 'Sin categoría'}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{producto.stock} unidades</div>
                  <div className="text-xs text-gray-500">Mín: {producto.stock_minimo}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">${parseFloat(producto.precio).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    producto.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                    producto.estado === 'bajo' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                    }`}>
                    {producto.estado === 'disponible' ? 'Disponible' :
                      producto.estado === 'bajo' ? 'Stock Bajo' : 'Crítico'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Dashboard del Administrador
const Dashboard = ({ estadisticas, productosStockBajo, ventasRecientes }) => (
  <div className="ml-64 p-6 bg-gray-50 min-h-screen">
    {estadisticas && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.totalProductos}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">En inventario</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-3xl font-bold text-gray-800">${estadisticas.ventasHoy.monto.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-600" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{estadisticas.ventasHoy.cambio}% vs ayer</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-orange-600">{estadisticas.stockBajo}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-orange-600">Requiere atención</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proveedores</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.proveedores.total}</p>
            </div>
            <Users className="w-12 h-12 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Registrados</span>
          </div>
        </div>
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Productos con Stock Bajo</h3>
        </div>
        <div className="p-6">
          {productosStockBajo.map(producto => (
            <div key={producto.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  producto.estado === 'critico' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                <div>
                  <p className="font-medium text-gray-800">{producto.nombre}</p>
                  <p className="text-sm text-gray-600">{producto.categoria_nombre || 'Sin categoría'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{producto.stock} unidades</p>
                <p className="text-sm text-gray-600">Mín: {producto.stock_minimo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Ventas Recientes</h3>
        </div>
        <div className="p-6">
          {ventasRecientes.map(venta => (
            <div key={venta.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-800">
                  {venta.productos ? venta.productos.substring(0, 30) + '...' : 'Venta #' + venta.id}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(venta.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">${parseFloat(venta.total).toLocaleString()}</p>
                <p className="text-sm text-gray-600">{venta.total_items} items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Productos del Administrador
const Productos = ({ productos, cargarProductos, eliminarProducto, categorias }) => {
  // --- Estados para el formulario y modal ---
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: "",
    stock: 0,
    stock_minimo: 0,
    precio: 0,
    codigo_barras: ""
  });

  // --- Funciones del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = productoEditando
        ? `${API_URL}/productos/${productoEditando.id}`
        : `${API_URL}/productos`;
      const method = productoEditando ? 'PUT' : 'POST';

      // Asegurarse de que los números se envíen como números
      const body = {
        ...formulario,
        categoria_id: formulario.categoria_id ? parseInt(formulario.categoria_id) : null,
        stock: parseInt(formulario.stock),
        stock_minimo: parseInt(formulario.stock_minimo),
        precio: parseFloat(formulario.precio)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        alert(productoEditando ? 'Producto actualizado' : 'Producto creado exitosamente');
        cargarProductos(); // Recarga la lista de productos
        cerrarFormulario();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const abrirFormulario = () => {
    setProductoEditando(null);
    setFormulario({
      nombre: "",
      descripcion: "",
      categoria_id: "",
      stock: 0,
      stock_minimo: 0,
      precio: 0,
      codigo_barras: ""
    });
    setMostrarFormulario(true);
  };

  const editarProducto = (producto) => {
    setProductoEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || "",
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      precio: producto.precio,
      codigo_barras: producto.codigo_barras || ""
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditando(null);
  };


  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      
      {/* --- Modal de Formulario --- */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* --- Campos del Formulario --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoria_id"
                  value={formulario.categoria_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formulario.precio}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formulario.stock}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formulario.stock_minimo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                <input
                  type="text"
                  name="codigo_barras"
                  value={formulario.codigo_barras}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              {/* --- Botones del Formulario --- */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {productoEditando ? 'Actualizar' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Lista de Productos (Tu código original) --- */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Lista de Productos ({productos.length})</h3>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cargarProductos}
                className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              {/* --- BOTÓN AHORA CONECTADO --- */}
              <button 
                onClick={abrirFormulario}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map(producto => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{producto.nombre}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria_nombre || 'Sin categoría'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{producto.stock} unidades</div>
                    <div className="text-xs text-gray-500">Mín: {producto.stock_minimo}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${parseFloat(producto.precio).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      producto.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                      producto.estado === 'bajo' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                      }`}>
                      {producto.estado === 'disponible' ? 'Disponible' :
                        producto.estado === 'bajo' ? 'Stock Bajo' : 'Crítico'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* --- BOTÓN AHORA CONECTADO --- */}
                      <button 
                        onClick={() => editarProducto(producto)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Componente de Ventas (de tu app.pdf) ----
const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const response = await fetch(`${API_URL}/ventas`);
      const data = await response.json();
      if (data.success) {
        setVentas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  const verDetalle = async (ventald) => {
    try {
      const response = await fetch(`${API_URL}/ventas/${ventald}`);
      const data = await response.json();
      if (data.success) {
        setVentaSeleccionada(data.data);
        setMostrarDetalle(true);
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const cancelarVenta = async (ventald) => {
    if (!window.confirm('¿Estás seguro de cancelar esta venta? Se devolverá el stock.')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/ventas/${ventald}/cancelar`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (data.success) {
        alert('Venta cancelada exitosamente');
        cargarVentas();
        setMostrarDetalle(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      alert('Error al cancelar la venta');
    }
  };

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      {/* Modal de Detalle */}
      {mostrarDetalle && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalle de Venta #{ventaSeleccionada.id}</h3>
              <button onClick={() => setMostrarDetalle(false)} className="text-gray-500 hover:text-gray-700">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">{new Date(ventaSeleccionada.created_at).toLocaleString('es-ES')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendedor</p>
                <p className="font-semibold">{ventaSeleccionada.vendedor_nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-semibold uppercase">{ventaSeleccionada.metodo_pago}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ ventaSeleccionada.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                  {ventaSeleccionada.estado === 'completada' ? 'Completada' : 'Cancelada'}
                </span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-3">Productos</h4>
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio Unit.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaSeleccionada.detalle && ventaSeleccionada.detalle.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3 text-sm">{item.producto_nombre}</td>
                      <td className="px-4 py-3 text-sm">{item.cantidad}</td>
                      <td className="px-4 py-3 text-sm">${parseFloat(item.precio_unitario).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold">${parseFloat(item.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-green-600">${parseFloat(ventaSeleccionada.total).toLocaleString()}</p>
              </div>
              {ventaSeleccionada.estado === 'completada' && (
                <button
                  onClick={() => cancelarVenta(ventaSeleccionada.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancelar Venta
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Lista de Ventas */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Ventas ({ventas.length})</h3>
            <button
              onClick={cargarVentas}
              className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hay ventas registradas aún
                  </td>
                </tr>
              ) : (
                ventas.map(venta => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{venta.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(venta.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{venta.vendedor_nombre}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${parseFloat(venta.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 uppercase">{venta.metodo_pago}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ venta.estado === 'completada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                        {venta.estado === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => verDetalle(venta.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Componente de Proveedores (de tu app.pdf) ----
const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: ""
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores`);
      const data = await response.json();
      if (data.success) {
        setProveedores(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = proveedorEditando
        ? `${API_URL}/proveedores/${proveedorEditando.id}`
        : `${API_URL}/proveedores`;
      const method = proveedorEditando ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulario),
      });
      const data = await response.json();
      if (data.success) {
        alert(proveedorEditando ? 'Proveedor actualizado' : 'Proveedor creado exitosamente');
        cargarProveedores();
        cerrarFormulario();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const editarProveedor = (proveedor) => {
    setProveedorEditando(proveedor);
    setFormulario({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || "",
      telefono: proveedor.telefono || "",
      email: proveedor.email || "",
      direccion: proveedor.direccion || ""
    });
    setMostrarFormulario(true);
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/proveedores/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Proveedor eliminado exitosamente');
        cargarProveedores();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert('Error al eliminar el proveedor');
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProveedorEditando(null);
    setFormulario({
      nombre: "",
      contacto: "",
      telefono: "",
      email: "",
      direccion: ""
    });
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input
                  type="text"
                  name="contacto"
                  value={formulario.contacto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {proveedorEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lista de Proveedores */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Proveedores ({proveedores.length})</h3>
            <div className="flex space-x-3">
              <button
                onClick={cargarProveedores}
                className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proveedores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                proveedores.map(proveedor => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{proveedor.nombre}</div>
                      {proveedor.direccion && (
                        <div className="text-sm text-gray-500">{proveedor.direccion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proveedor.contacto || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proveedor.telefono || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proveedor.email || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editarProveedor(proveedor)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarProveedor(proveedor.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Secciones placeholder
const OtrasSecciones = ({ titulo }) => (
  <div className="ml-64 p-6 bg-gray-50 min-h-screen">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{titulo}</h3>
      <p className="text-gray-600 mb-6">Esta sección está en desarrollo.</p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Ver Más
      </button>
    </div>
  </div>
);


// ---- NUEVO: Componente Modal de Crédito ----
const ModalCredito = ({
  show,
  onClose,
  clientes,
  busqueda,
  onBusquedaChange,
  onClienteSelect,
  onCrearCliente,
  loading
}) => {
  // Estos Hooks están BIEN aquí, porque este es un componente
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [showForm, setShowForm] = useState(false);

  if (!show) return null;

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrearCliente = () => {
    if (!nombreNuevo) {
      alert('El nombre es requerido');
      return;
    }
    onCrearCliente(nombreNuevo, telefonoNuevo);
    
    setNombreNuevo("");
    setTelefonoNuevo("");
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        
        {!showForm ? (
          <>
            <h3 className="text-lg font-semibold mb-2">Seleccionar Cliente</h3>
            <input
              type="text"
              placeholder="Buscar cliente por nombre..."
              className="w-full p-2 border rounded-lg mb-4"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => onClienteSelect(cliente)}
                  >
                    <p className="font-medium">{cliente.nombre}</p>
                    <p className="text-sm text-gray-600">{cliente.telefono || 'Sin teléfono'}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500 text-center">No se encontraron clientes.</p>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4"
            >
              Crear Nuevo Cliente
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Crear Nuevo Cliente</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre Completo"
                className="w-full p-2 border rounded-lg"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Teléfono (Opcional)"
                className="w-full p-2 border rounded-lg"
                value={telefonoNuevo}
                onChange={(e) => setTelefonoNuevo(e.target.value)}
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearCliente}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar y Seleccionar'}
              </button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 mt-6"
          disabled={loading}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// ---- NUEVO: Componente Cuentas por Cobrar ----
const CuentasPorCobrarComponent = ({ cuentas, onPagar, userId }) => {
      
  const handleAbonar = (cuenta) => {
    const monto = prompt(`¿Cuánto deseas abonar a la cuenta de ${cuenta.cliente_nombre}?\nPendiente: $${parseFloat(cuenta.monto_pendiente).toLocaleString()}`);
    if (monto) {
      onPagar(cuenta.id, monto, cuenta.monto_pendiente);
    }
  };

  const handleLiquidar = (cuenta) => {
    // Llama a onPagar con el monto total pendiente
    onPagar(cuenta.id, cuenta.monto_pendiente, cuenta.monto_pendiente);
  };

  return (
    <div className="ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Cuentas por Cobrar Pendientes ({cuentas.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Pendiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuentas.map(cuenta => (
                <tr key={cuenta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cuenta.cliente_nombre}</div>
                    <div className="text-sm text-gray-500">{cuenta.cliente_telefono}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${parseFloat(cuenta.monto_total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">
                    ${parseFloat(cuenta.monto_pendiente).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(cuenta.fecha_venta).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAbonar(cuenta)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Abonar
                      </button>
                      <button
                        onClick={() => handleLiquidar(cuenta)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Liquidar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cuentas.length === 0 && (
          <p className="p-8 text-center text-gray-500">No hay cuentas pendientes por cobrar.</p>
        )}
      </div>
    </div>
  );
};


export default App;