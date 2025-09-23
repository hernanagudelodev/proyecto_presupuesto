import { NavLink, Outlet } from 'react-router-dom';
import { Container, Title, Tabs } from '@mantine/core';

// Este componente es un "layout" para la sección de configuración.
// Muestra un título y las pestañas de navegación, y luego usa <Outlet>
// para renderizar la página hija activa (Cuentas o Categorías).
function Configuration() {
  return (
    <Container size="lg" my="md">
      <Title order={1} mb="xl">Configuración</Title>

      {/* Usamos el componente Tabs de Mantine para la navegación interna */}
      <Tabs defaultValue="accounts">
        <Tabs.List>
          {/* Cada pestaña es un NavLink para que se integre con el router */}
          <Tabs.Tab value="accounts" component={NavLink} to="/configuration/accounts">
            Cuentas
          </Tabs.Tab>
          <Tabs.Tab value="categories" component={NavLink} to="/configuration/categories">
            Categorías
          </Tabs.Tab>
          <Tabs.Tab value="user" component={NavLink} to="/configuration/user">
            Usuario
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* El <Outlet> renderizará aquí ManageAccounts o ManageCategories */}
      <main style={{ paddingTop: '2rem' }}>
        <Outlet />
      </main>
    </Container>
  );
}

export default Configuration;