import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Creamos el contexto (el tablón de anuncios)
const AuthContext = createContext();

// 2. Creamos el "Proveedor" del contexto. Es un componente que envolverá nuestra app.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // Usamos useEffect para configurar el token en Axios cada vez que cambie
  useEffect(() => {
    if (token) {
      // Si hay token, lo guardamos en localStorage y en los encabezados de Axios
      localStorage.setItem('accessToken', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Si no hay token, lo removemos
      localStorage.removeItem('accessToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Función para iniciar sesión: guarda el token en nuestro estado
  const login = (newToken) => {
    setToken(newToken);
  };

  // Función para cerrar sesión: borra el token
  const logout = () => {
    setToken(null);
  };

  // El valor que nuestro tablón de anuncios compartirá
  const value = {
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Creamos un "hook" personalizado para usar nuestro contexto más fácilmente
export function useAuth() {
  return useContext(AuthContext);
}