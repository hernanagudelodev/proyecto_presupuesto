import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { token } = useAuth(); // Lee el token de nuestro "tablón de anuncios" global

  // Comprueba si el usuario está autenticado
  if (!token) {
    // Si no hay token, redirige al usuario a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si hay un token, muestra la página que se está intentando visitar (el Outlet)
  return <Outlet />;
}

export default ProtectedRoute;