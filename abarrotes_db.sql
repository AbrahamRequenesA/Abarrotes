-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-12-2025 a las 07:18:09
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `abarrotes_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'Granos', 'Arroz, frijol, lentejas', '2025-11-13 15:48:09'),
(2, 'Aceites', 'Aceites vegetales y de cocina', '2025-11-13 15:48:09'),
(3, 'Lácteos', 'Leche, yogurt, queso', '2025-11-13 15:48:09'),
(4, 'Panadería', 'Pan, galletas, pasteles', '2025-11-13 15:48:09'),
(5, 'Endulzantes', 'Azúcar, miel, edulcorantes', '2025-11-13 15:48:09'),
(6, 'Bebidas', 'Refrescos, jugos, agua', '2025-11-13 15:48:09'),
(7, 'Enlatados', 'Conservas y productos enlatados', '2025-11-13 15:48:09'),
(8, 'Limpieza', 'Productos de limpieza del hogar', '2025-11-13 15:48:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `telefono`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Juan Pérez', '3001234567', 'Calle 10 #20-30', 1, '2025-11-13 16:13:10', '2025-11-13 16:13:10'),
(2, 'María González', '3109876543', 'Carrera 15 #45-20', 1, '2025-11-13 16:13:10', '2025-11-13 16:13:10'),
(3, 'Carlos Rodríguez', '3201122334', 'Avenida 5 #12-45', 1, '2025-11-13 16:13:10', '2025-11-13 16:13:10'),
(4, 'Luis Luis Luis', '923412334', '', 1, '2025-11-14 18:12:45', '2025-11-14 18:12:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas_por_cobrar`
--

CREATE TABLE `cuentas_por_cobrar` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT 0.00,
  `monto_pendiente` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','vencido') DEFAULT 'pendiente',
  `fecha_vencimiento` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuentas_por_cobrar`
--

INSERT INTO `cuentas_por_cobrar` (`id`, `cliente_id`, `venta_id`, `monto_total`, `monto_pagado`, `monto_pendiente`, `estado`, `fecha_vencimiento`, `notas`, `created_at`, `updated_at`) VALUES
(1, 3, 9, 152.00, 152.00, 0.00, 'pagado', NULL, NULL, '2025-11-14 17:58:02', '2025-11-14 21:12:49'),
(2, 4, 10, 9057.00, 5000.00, 4057.00, 'pendiente', NULL, NULL, '2025-11-14 18:12:47', '2025-11-28 23:35:36'),
(3, 4, 11, 16961.00, 0.00, 16961.00, 'pendiente', NULL, NULL, '2025-11-14 21:14:04', '2025-11-14 21:14:04'),
(4, 2, 13, 242597.00, 0.00, 242597.00, 'pendiente', NULL, NULL, '2025-11-28 22:33:58', '2025-11-28 22:33:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 1, 2500.00, 2500.00),
(2, 1, 5, 1, 3200.00, 3200.00),
(3, 1, 8, 1, 6200.00, 6200.00),
(4, 1, 7, 1, 4800.00, 4800.00),
(5, 2, 2, 1, 8900.00, 8900.00),
(6, 2, 7, 1, 4800.00, 4800.00),
(7, 2, 8, 1, 6200.00, 6200.00),
(8, 2, 5, 1, 3200.00, 3200.00),
(9, 2, 6, 1, 5500.00, 5500.00),
(10, 3, 2, 1, 8900.00, 8900.00),
(11, 4, 2, 10, 8900.00, 89000.00),
(12, 5, 1, 1, 2500.00, 2500.00),
(13, 5, 5, 1, 3200.00, 3200.00),
(14, 5, 7, 1, 4800.00, 4800.00),
(15, 5, 2, 1, 8900.00, 8900.00),
(16, 6, 3, 5, 4200.00, 21000.00),
(17, 7, 3, 1, 4200.00, 4200.00),
(18, 8, 3, 1, 4200.00, 4200.00),
(19, 9, 91, 1, 110.00, 110.00),
(20, 9, 63, 1, 42.00, 42.00),
(21, 10, 91, 1, 110.00, 110.00),
(22, 10, 62, 1, 47.00, 47.00),
(23, 10, 2, 1, 8900.00, 8900.00),
(24, 11, 91, 1, 110.00, 110.00),
(25, 11, 63, 1, 42.00, 42.00),
(26, 11, 108, 1, 9.00, 9.00),
(27, 11, 3, 4, 4200.00, 16800.00),
(28, 12, 62, 14, 47.00, 658.00),
(29, 13, 62, 1, 47.00, 47.00),
(30, 13, 91, 5, 110.00, 550.00),
(31, 13, 6, 44, 5500.00, 242000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `tipo` enum('entrada','salida','ajuste') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `motivo` varchar(200) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_inventario`
--

INSERT INTO `movimientos_inventario` (`id`, `producto_id`, `tipo`, `cantidad`, `motivo`, `usuario_id`, `created_at`) VALUES
(1, 1, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:02'),
(2, 5, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:02'),
(3, 8, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:02'),
(4, 7, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:02'),
(5, 2, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:10'),
(6, 7, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:10'),
(7, 8, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:10'),
(8, 5, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:10'),
(9, 6, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:10'),
(10, 2, 'salida', 1, 'Venta', 2, '2025-11-13 16:07:14'),
(11, 2, 'salida', 10, 'Venta', 2, '2025-11-13 16:07:22'),
(12, 1, 'salida', 1, 'Venta', 2, '2025-11-13 17:32:10'),
(13, 5, 'salida', 1, 'Venta', 2, '2025-11-13 17:32:10'),
(14, 7, 'salida', 1, 'Venta', 2, '2025-11-13 17:32:10'),
(15, 2, 'salida', 1, 'Venta', 2, '2025-11-13 17:32:10'),
(16, 3, 'salida', 5, 'Venta', 2, '2025-11-13 19:28:19'),
(17, 3, 'salida', 1, 'Venta', 2, '2025-11-13 20:33:48'),
(18, 3, 'salida', 1, 'Venta', 2, '2025-11-14 16:21:51'),
(19, 91, 'salida', 1, 'Venta', 2, '2025-11-14 17:58:02'),
(20, 63, 'salida', 1, 'Venta', 2, '2025-11-14 17:58:02'),
(21, 91, 'salida', 1, 'Venta', 2, '2025-11-14 18:12:47'),
(22, 62, 'salida', 1, 'Venta', 2, '2025-11-14 18:12:47'),
(23, 2, 'salida', 1, 'Venta', 2, '2025-11-14 18:12:47'),
(24, 91, 'salida', 1, 'Venta', 2, '2025-11-14 21:14:04'),
(25, 63, 'salida', 1, 'Venta', 2, '2025-11-14 21:14:04'),
(26, 108, 'salida', 1, 'Venta', 2, '2025-11-14 21:14:04'),
(27, 3, 'salida', 4, 'Venta', 2, '2025-11-14 21:14:04'),
(28, 62, 'salida', 14, 'Venta', 2, '2025-11-28 19:39:41'),
(29, 62, 'salida', 1, 'Venta', 2, '2025-11-28 22:33:58'),
(30, 91, 'salida', 5, 'Venta', 2, '2025-11-28 22:33:58'),
(31, 6, 'salida', 44, 'Venta', 2, '2025-11-28 22:33:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos_cuenta`
--

CREATE TABLE `pagos_cuenta` (
  `id` int(11) NOT NULL,
  `cuenta_id` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo',
  `usuario_id` int(11) NOT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos_cuenta`
--

INSERT INTO `pagos_cuenta` (`id`, `cuenta_id`, `monto`, `metodo_pago`, `usuario_id`, `notas`, `created_at`) VALUES
(1, 1, 2.00, 'efectivo', 1, NULL, '2025-11-14 17:58:16'),
(2, 1, 50.00, 'efectivo', 1, NULL, '2025-11-14 21:12:36'),
(3, 1, 100.00, 'efectivo', 1, NULL, '2025-11-14 21:12:49'),
(4, 2, 5000.00, 'efectivo', 1, NULL, '2025-11-28 23:35:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `precio` decimal(10,2) NOT NULL,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `categoria_id`, `stock`, `stock_minimo`, `precio`, `codigo_barras`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Arroz Diana 500g', NULL, 1, 148, 50, 2500.00, '7702001234567', 1, '2025-11-13 15:48:09', '2025-11-13 17:32:10'),
(2, 'Aceite Gourmet 1L', NULL, 2, 21, 30, 8900.00, '7702001234568', 1, '2025-11-13 15:48:09', '2025-11-14 18:12:47'),
(3, 'Leche Alpina 1L', NULL, 3, 0, 20, 4200.00, '7702001234569', 1, '2025-11-13 15:48:09', '2025-11-14 21:14:04'),
(4, 'Pan Bimbo Tajado', NULL, 4, 80, 25, 3500.00, '7702001234570', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09'),
(5, 'Azúcar San Luis 1kg', NULL, 5, 197, 75, 3200.00, '7702001234571', 1, '2025-11-13 15:48:09', '2025-11-13 17:32:10'),
(6, 'Coca-Cola 2L', NULL, 6, 0, 30, 5500.00, '7702001234572', 1, '2025-11-13 15:48:09', '2025-11-28 22:33:58'),
(7, 'Atún Van Camps', NULL, 7, 57, 20, 4800.00, '7702001234573', 1, '2025-11-13 15:48:09', '2025-11-13 17:32:10'),
(8, 'Fabuloso 1L', NULL, 8, 33, 15, 6200.00, '7702001234574', 1, '2025-11-13 15:48:09', '2025-11-13 16:07:10'),
(59, 'Arroz Super Extra 1kg', NULL, 1, 100, 20, 28.50, '7501000000011', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(60, 'Frijol Negro 1kg', NULL, 1, 90, 20, 32.00, '7501000000012', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(61, 'Lentejas 1kg', NULL, 1, 80, 20, 25.50, '7501000000013', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(62, 'Aceite 1L La Fina', NULL, 2, 54, 10, 47.00, '7501000000014', 1, '2025-11-13 19:25:33', '2025-11-28 22:33:58'),
(63, 'Aceite Vegetal 900ml', NULL, 2, 58, 15, 42.00, '7501000000015', 1, '2025-11-13 19:25:33', '2025-11-14 21:14:04'),
(64, 'Leche Lala Entera 1L', NULL, 3, 120, 20, 26.00, '7501000000016', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(65, 'Leche Deslactosada Alpura 1L', NULL, 3, 80, 15, 27.50, '7501000000017', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(66, 'Yogurt Fresa 1L', NULL, 3, 60, 10, 32.00, '7501000000018', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(67, 'Queso Panela 400g', NULL, 3, 50, 10, 58.00, '7501000000019', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(68, 'Pan Bimbo Blanco 680g', NULL, 4, 100, 30, 44.00, '7501000000020', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(69, 'Pan Integral 600g', NULL, 4, 80, 20, 46.00, '7501000000021', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(70, 'Galletas María 170g', NULL, 4, 150, 40, 22.00, '7501000000022', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(71, 'Azúcar Estándar 1kg', NULL, 5, 200, 40, 29.00, '7501000000023', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(72, 'Miel Pura 500g', NULL, 5, 50, 10, 65.00, '7501000000024', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(73, 'Refresco Coca-Cola 2L', NULL, 6, 90, 30, 45.00, '7501000000025', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(74, 'Refresco Pepsi 2L', NULL, 6, 85, 25, 44.50, '7501000000026', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(75, 'Agua Bonafont 1.5L', NULL, 6, 100, 30, 22.00, '7501000000027', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(76, 'Jugo Del Valle Mango 1L', NULL, 6, 70, 15, 30.00, '7501000000028', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(77, 'Atún Dolores 140g', NULL, 7, 120, 30, 19.00, '7501000000029', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(78, 'Sardinas PicaPica 155g', NULL, 7, 80, 15, 21.00, '7501000000030', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(79, 'Chícharos en lata 400g', NULL, 7, 60, 10, 18.00, '7501000000031', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(80, 'Fabuloso Lavanda 1L', NULL, 8, 100, 20, 38.00, '7501000000032', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(81, 'Cloro Cloralex 1L', NULL, 8, 90, 20, 25.00, '7501000000033', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(82, 'Detergente Ariel 1kg', NULL, 8, 70, 15, 52.00, '7501000000034', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(83, 'Suavitel Fresca Primavera 1L', NULL, 8, 60, 10, 40.00, '7501000000035', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(84, 'Toallas de papel Pétalo 6pzas', NULL, 8, 50, 10, 65.00, '7501000000036', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(85, 'Crema corporal Nivea 200ml', NULL, 8, 40, 10, 70.00, '7501000000037', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(86, 'Café Legal 200g', NULL, 1, 80, 15, 48.00, '7501000000038', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(87, 'Avena Quaker 500g', NULL, 1, 100, 20, 35.00, '7501000000039', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(88, 'Cereal Zucaritas 500g', NULL, 1, 60, 15, 58.00, '7501000000040', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(89, 'Refresco Fanta 2L', NULL, 6, 75, 25, 43.50, '7501000000041', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(90, 'Refresco Sprite 2L', NULL, 6, 80, 25, 43.50, '7501000000042', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(91, 'Aceite de Oliva 500ml', NULL, 2, 32, 10, 110.00, '7501000000043', 1, '2025-11-13 19:25:33', '2025-11-28 22:33:58'),
(92, 'Mantequilla Gloria 90g', NULL, 3, 50, 10, 24.00, '7501000000044', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(93, 'Pan Molido 200g', NULL, 4, 70, 15, 20.00, '7501000000045', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(94, 'Chocolate Abuelita 180g', NULL, 5, 60, 10, 38.00, '7501000000046', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(95, 'Leche Condensada Nestlé 387g', NULL, 3, 40, 10, 30.00, '7501000000047', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(96, 'Leche Evaporada Carnation 360g', NULL, 3, 40, 10, 28.00, '7501000000048', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(97, 'Gelatina D’Gari Fresa 120g', NULL, 4, 90, 20, 12.00, '7501000000049', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(98, 'Cereal Choco Krispis 500g', NULL, 1, 60, 15, 56.00, '7501000000050', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(99, 'Papel Higiénico Regio 4pzas', NULL, 8, 80, 20, 40.00, '7501000000051', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(100, 'Shampoo Sedal 650ml', NULL, 8, 50, 10, 75.00, '7501000000052', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(101, 'Jabón Zest 3pzas', NULL, 8, 70, 15, 33.00, '7501000000053', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(102, 'Sopa Maruchan Pollo 64g', NULL, 1, 100, 20, 15.00, '7501000000054', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(103, 'Mayonesa McCormick 390g', NULL, 5, 60, 15, 48.00, '7501000000055', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(104, 'Catsup Del Monte 400g', NULL, 5, 60, 15, 34.00, '7501000000056', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(105, 'Sal La Fina 1kg', NULL, 5, 80, 20, 16.00, '7501000000057', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(106, 'Vinagre Blanco 500ml', NULL, 5, 50, 10, 14.00, '7501000000058', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(107, 'Cereal Corn Flakes 500g', NULL, 1, 70, 15, 50.00, '7501000000059', 1, '2025-11-13 19:25:33', '2025-11-13 19:25:33'),
(108, 'Atole Maizena Vainilla 47g', NULL, 1, 89, 20, 9.00, '7501000000060', 1, '2025-11-13 19:25:33', '2025-11-14 21:14:04'),
(110, 'Prueba', 'srtyfgdfg', 5, 234, 234, 3453.00, '234535657879809', 1, '2025-11-14 21:15:02', '2025-11-14 21:15:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`, `email`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Distribuidora Nacional', 'Carlos López', '3001234567', 'contacto@distnacional.com', 'Calle 10 #20-30', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09'),
(2, 'Alimentos del Valle', 'María González', '3109876543', 'ventas@alimentosvalle.com', 'Carrera 15 #45-20', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09'),
(3, 'Lácteos Frescos SAS', 'Pedro Ramírez', '3201122334', 'info@lactesfrescos.com', 'Avenida 5 #12-45', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09'),
(4, 'Distribuidora del Centro', 'Ana Ramírez', '4491112233', 'contacto@centro.com', 'Av. Insurgentes #123', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(5, 'Abarrotera del Norte', 'Jorge Pérez', '4492223344', 'ventas@norte.com', 'Calle Hidalgo #456', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(6, 'Lácteos San Marcos', 'María López', '4493334455', 'info@sanmarcos.com', 'Blvd. Aguascalientes #789', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(7, 'Aceites del Bajío', 'Luis García', '4494445566', 'contacto@bajio.com', 'Calle Madero #321', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(8, 'Panadería La Espiga', 'Carmen Ruiz', '4495556677', 'ventas@laespiga.com', 'Calle Juárez #101', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(9, 'Refrescos del Valle', 'Pedro Díaz', '4496667788', 'info@delvalle.com', 'Av. Universidad #202', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(10, 'Productos Don José', 'Elena Torres', '4497778899', 'contacto@donjose.com', 'Av. Las Américas #505', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(11, 'Conservas El Buen Sabor', 'Hugo Hernández', '4498889900', 'ventas@elbuensabor.com', 'Calle Morelos #707', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(12, 'Limpieza Total', 'Silvia Castro', '4499990011', 'info@limpiezatotal.com', 'Av. Siglo XXI #909', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09'),
(13, 'Distribuidora del Pacífico', 'Raúl Mendoza', '4491011122', 'contacto@pacifico.com', 'Av. López Mateos #808', 1, '2025-11-13 19:25:09', '2025-11-13 19:25:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','vendedor') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'admin', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09'),
(2, 'Vendedor 1', 'vendedor@abarrotes.com', '$2a$10$Xr9qj3.1YxZQYxZQYxZQYeN8VqXKx4KQQJj5J5J5J5J5J5J5J5J5K', 'vendedor', 1, '2025-11-13 15:48:09', '2025-11-13 15:48:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo',
  `tipo_pago` enum('contado','credito') DEFAULT 'contado',
  `estado` enum('completada','cancelada') DEFAULT 'completada',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `usuario_id`, `total`, `metodo_pago`, `tipo_pago`, `estado`, `created_at`) VALUES
(1, 2, 16700.00, 'efectivo', 'contado', 'completada', '2025-11-13 16:07:02'),
(2, 2, 28600.00, 'efectivo', 'contado', 'completada', '2025-11-13 16:07:10'),
(3, 2, 8900.00, 'efectivo', 'contado', 'completada', '2025-11-13 16:07:14'),
(4, 2, 89000.00, 'efectivo', 'contado', 'cancelada', '2025-11-13 16:07:22'),
(5, 2, 19400.00, 'efectivo', 'contado', 'completada', '2025-11-13 17:32:10'),
(6, 2, 21000.00, 'efectivo', 'contado', 'cancelada', '2025-11-13 19:28:19'),
(7, 2, 4200.00, 'efectivo', 'contado', 'completada', '2025-11-13 20:33:48'),
(8, 2, 4200.00, 'efectivo', 'contado', 'cancelada', '2025-11-14 16:21:51'),
(9, 2, 152.00, '', 'credito', 'completada', '2025-11-14 17:58:02'),
(10, 2, 9057.00, '', 'credito', 'completada', '2025-11-14 18:12:47'),
(11, 2, 16961.00, '', 'credito', 'completada', '2025-11-14 21:14:04'),
(12, 2, 658.00, 'efectivo', 'contado', 'completada', '2025-11-28 19:39:41'),
(13, 2, 242597.00, '', 'credito', 'completada', '2025-11-28 22:33:58');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cliente` (`cliente_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_venta` (`venta_id`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pagos_cuenta`
--
ALTER TABLE `pagos_cuenta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_cuenta` (`cuenta_id`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_barras` (`codigo_barras`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `pagos_cuenta`
--
ALTER TABLE `pagos_cuenta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  ADD CONSTRAINT `cuentas_por_cobrar_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cuentas_por_cobrar_ibfk_2` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pagos_cuenta`
--
ALTER TABLE `pagos_cuenta`
  ADD CONSTRAINT `pagos_cuenta_ibfk_1` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas_por_cobrar` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pagos_cuenta_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
