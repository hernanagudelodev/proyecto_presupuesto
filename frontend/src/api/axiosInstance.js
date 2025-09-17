import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- LÓGICA DE INTERCEPTOR PARA EL TOKEN ---

// Leemos el token del localStorage cuando la app carga
const token = localStorage.getItem('accessToken');
if (token) {
  // Si existe un token, lo ponemos como encabezado por defecto
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// También usamos un "interceptor" para actualizar el token si cambia
// (por ejemplo, en el futuro si implementas refresco de tokens)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;