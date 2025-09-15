import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function App() {
  // El componente <Outlet /> es un marcador de posición.
  // React Router lo reemplazará con el componente de la ruta actual.
  const { token, logout } = useAuth(); // Obtenemos el token y la función logout del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/login'); // Redirige al usuario al login
  };

  return (
    <div>
      <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mi App de Presupuesto</h2>
        {/* Mostramos el botón solo si el usuario está autenticado (si hay token) */}
        {token && (
          <button onClick={handleLogout}>
            Cerrar Sesión
          </button>
        )}
      </header>

      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;