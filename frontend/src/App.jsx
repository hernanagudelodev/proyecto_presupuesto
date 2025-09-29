import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// 1. Importamos los componentes necesarios para el menú móvil
import { AppShell, Group, Button, Title, Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; // Hook para abrir/cerrar el menú
// Nuevo import para el botón flotante
import GlobalAddTransactionButton from './components/GlobalAddTransactionButton';
import GlobalBalanceIndicator from './components/GlobalBalanceIndicator';

function App() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  // 2. Estado para controlar si el menú móvil (Drawer) está abierto o cerrado
  const [opened, { toggle, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    close(); // Cierra el menú móvil si está abierto al hacer logout
  };

  // Estilos para los NavLink (sin cambios)
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
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header>
        <Group position="apart" sx={{ height: '100%' }} px="md">
          {/* 3. Contenedor izquierdo del header */}
          <Group>
            {/* El Burger solo será visible si hay un token (usuario logueado) */}
            {token && (
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm" // <-- Se oculta en pantallas grandes (sm y superior)
                size="sm"
              />
            )}
            <Title order={3}>Mi App de Presupuesto</Title>
          </Group>

          {/* 4. Menú para escritorio: solo visible en pantallas grandes */}
          {token && (
            <Group visibleFrom="sm"> {/* <-- Se muestra en pantallas grandes */}
              <NavLink to="/dashboard" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}>Dashboard</NavLink>
              <NavLink to="/transactions" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}>Historial</NavLink>
              <NavLink to="/rules" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}>Reglas Recurrentes</NavLink>
              <NavLink to="/configuration" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles}>Configuración</NavLink>
              <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {/* 5. Menú lateral (Drawer) para móvil */}
      <Drawer opened={opened} onClose={close} title="Menú" size="sm">
        <Stack>
          <NavLink to="/dashboard" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles} onClick={close}>Dashboard</NavLink>
          <NavLink to="/transactions" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles} onClick={close}>Historial</NavLink>
          <NavLink to="/rules" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles} onClick={close}>Reglas Recurrentes</NavLink>
          <NavLink to="/configuration" style={({ isActive }) => isActive ? {...linkStyles, ...activeLinkStyles} : linkStyles} onClick={close}>Configuración</NavLink>
          <Button variant="outline" onClick={handleLogout} mt="md">Cerrar Sesión</Button>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      {/* 2. Añadimos el botón flotante aquí */}
      {/* Solo se mostrará si el usuario ha iniciado sesión (si existe un token) */}
      {token && (
        <>
          <GlobalBalanceIndicator />
          <GlobalAddTransactionButton />
        </>
      )}
    </AppShell>
  );
}

export default App;