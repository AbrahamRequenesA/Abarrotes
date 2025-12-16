import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './src/screens/LoginScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import VentasScreen from './src/screens/VentasScreen';
import ProveedoresScreen from './src/screens/ProveedoresScreen';
import DetalleProductoScreen from './src/screens/DetalleProductoScreen';
import AgregarProductoScreen from './src/screens/AgregarProductoScreen';
import EscanearCodigoScreen from './src/screens/EscanearCodigoScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Inventario"
        component={InventarioScreen}
        options={{
          tabBarLabel: 'Inventario',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={VentasScreen}
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Proveedores"
        component={ProveedoresScreen}
        options={{
          tabBarLabel: 'Proveedores',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏢</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DetalleProducto"
          component={DetalleProductoScreen}
          options={{ title: 'Detalle del Producto' }}
        />
        <Stack.Screen
          name="AgregarProducto"
          component={AgregarProductoScreen}
          options={{ title: 'Nuevo Producto' }}
        />
        <Stack.Screen
          name="EscanearCodigo"
          component={EscanearCodigoScreen}
          options={{ title: 'Escanear Código', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
