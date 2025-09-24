// frontend/src/pages/Configuration.jsx
import { NavLink, Outlet } from 'react-router-dom';
import { Container, Title, Tabs } from '@mantine/core';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importamos el hook useAuth

function Configuration() {
  const { user } = useAuth(); // <-- 2. Obtenemos el usuario del contexto

  return (
    <Container size="lg" my="md">
      <Title order={1} mb="xl">Configuración</Title>

      <Tabs defaultValue="accounts">
        <Tabs.List>
          <Tabs.Tab value="accounts" component={NavLink} to="/configuration/accounts">
            Cuentas
          </Tabs.Tab>
          <Tabs.Tab value="categories" component={NavLink} to="/configuration/categories">
            Categorías
          </Tabs.Tab>
          <Tabs.Tab value="user" component={NavLink} to="/configuration/user">
            Mi Perfil
          </Tabs.Tab>

          {/* 3. Lógica condicional: esta pestaña solo se renderiza si user.is_superuser es true */}
          {user && user.is_superuser && (
            <Tabs.Tab value="users" component={NavLink} to="/configuration/users">
              Usuarios (Admin)
            </Tabs.Tab>
          )}

        </Tabs.List>
      </Tabs>

      <main style={{ paddingTop: '2rem' }}>
        <Outlet />
      </main>
    </Container>
  );
}

export default Configuration;