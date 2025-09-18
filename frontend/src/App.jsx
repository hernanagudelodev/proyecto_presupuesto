import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppShell, Group, Button, Title } from '@mantine/core'; // <-- Importamos componentes de layout

function App() {
  // El componente <Outlet /> es un marcador de posición.
  // React Router lo reemplazará con el componente de la ruta actual.
  const { token, logout } = useAuth(); // Obtenemos el token y la función logout del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/login'); // Redirige al usuario al login
  };

  // Estilos para los NavLink
  const linkStyles = {
    padding: '10px 15px',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '4px',
  };

  const activeLinkStyles = {
    backgroundColor: '#e7f5ff',
    color: '#1971c2',
    fontWeight: 'bold',
  };

  return (
    // <AppShell> es un componente de Mantine para la estructura principal de la app
    <AppShell
      padding="md"
      // 1. La configuración del header ahora es un objeto
      header={{ height: 60 }}
    >
      {/* 2. Usamos el sub-componente <AppShell.Header> */}
      <AppShell.Header>
        <Group position="apart" sx={{ height: '100%' }} px="md">
          <Title order={3}>Mi App de Presupuesto</Title>

          {token && (
            <Group>
              <NavLink 
                to="/dashboard" 
                style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/transactions" 
                style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}
              >
                Historial
              </NavLink>
              <NavLink 
                to="/rules" 
                style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}
              >
                Reglas Recurrentes
              </NavLink>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {/* 3. El contenido principal ahora va dentro de <AppShell.Main> */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;