// frontend/src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos el Proveedor del contexto
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null); // <-- NUEVO: Estado para guardar los datos del usuario
  const [loading, setLoading] = useState(true); // <-- NUEVO: Estado para saber si estamos verificando el token inicial

  // Función para obtener los datos del usuario usando el token
  const fetchUser = useCallback(async () => {
    if (localStorage.getItem('accessToken')) {
      try {
        const response = await axiosInstance.get('/users/me');
        setUser(response.data); // Guardamos el usuario en el estado
      } catch (error) {
        // Si el token es inválido, lo limpiamos
        console.error("Token inválido, cerrando sesión.", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Efecto que se ejecuta solo una vez al cargar la app
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Función para iniciar sesión
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('accessToken', newToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    fetchUser(); // Después de hacer login, obtenemos los datos del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null); // Limpiamos el usuario
    localStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  // El valor que nuestro contexto compartirá
  const value = {
    token,
    user, // <-- NUEVO: Compartimos el usuario
    loading, // <-- NUEVO: Compartimos el estado de carga
    login,
    logout,
  };

  // No mostramos la app hasta que terminemos la carga inicial
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}