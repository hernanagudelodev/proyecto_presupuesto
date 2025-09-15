import axios from 'axios';

// Creamos una instancia de Axios con una configuración predeterminada
const axiosInstance = axios.create({
  // Usamos la variable de entorno que definimos en el archivo .env
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default axiosInstance;