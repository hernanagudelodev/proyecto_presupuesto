import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Modal from 'react-modal';
import { AuthProvider } from './context/AuthContext';

import App from './App.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
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
      // grupo de rutas protegidas
      {
        element: <ProtectedRoute />, // El guardia vigila a todos sus "hijos"
        children: [
          {
            path: '/dashboard', // Esta ruta ahora está protegida
            element: <Dashboard />,
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
    {/* Envuelve la app con el AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);