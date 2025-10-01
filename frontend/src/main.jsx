import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Modal from 'react-modal';
import { AuthProvider } from './context/AuthContext';

// Importa el proveedor de Mantine y los estilos base
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import App from './App.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TransactionsHistory from './pages/TransactionsHistory.jsx';
import RecurringRules from './pages/RecurringRules.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ManageAccounts from './pages/ManageAccounts'; // NUEVO
import ManageCategories from './pages/ManageCategories'; // NUEVO
import Configuration from './pages/Configuration.jsx'; 
import ManageUser from './pages/ManageUser';
import ManageUsers from './pages/ManageUsers';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import './index.css';

Modal.setAppElement('#root');

// Creamos nuestro enrutador (el mapa de la aplicación)
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Ruta índice: si alguien va a la raíz '/', lo redirigimos a '/login'
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      // Ruta para la página de Login
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/auth/reset-password',
        element: <ResetPassword />,
      },
      // grupo de rutas protegidas
      {
        element: <ProtectedRoute />, // El guardia vigila a todos sus "hijos"
        children: [
          {
            path: '/dashboard', // Esta ruta ahora está protegida
            element: <Dashboard />,
          },
          {
            path: '/transactions',
            element: <TransactionsHistory />,
          },
          {
            path: '/rules',
            element: <RecurringRules />,
          },
          // --- NUEVA ESTRUCTURA DE RUTAS ANIDADAS ---
          {
            path: '/configuration',
            element: <Configuration />, // El layout principal de configuración
            children: [
              // La ruta por defecto redirige a 'accounts'
              { index: true, element: <Navigate to="/configuration/accounts" replace /> },
              { path: 'accounts', element: <ManageAccounts /> },
              { path: 'categories', element: <ManageCategories /> },
              { path: 'user', element: <ManageUser /> },
              { path: 'users', element: <ManageUsers /> }, // <-- Nueva ruta protegida (solo admins)
            ]
          },
          // Si en el futuro tienes más rutas protegidas, irían aquí
          // { path: '/perfil', element: <Profile /> },
        ],
      },
    ],
  },
]);

// Le decimos a React que use nuestro enrutador
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve TODO con el MantineProvider */}
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);