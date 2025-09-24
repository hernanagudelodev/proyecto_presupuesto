// frontend/src/pages/ManageUsers.jsx
import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Text, Switch, Alert, ScrollArea } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import axiosInstance from '../api/axiosInstance';
// Aún no hemos creado estos, pero los importamos de una vez
import GenericModal from '../components/GenericModal';
import EditUserForm from '../components/EditUserForm';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Para el modal de edición

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/admin/users/');
      setUsers(response.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('No tienes los permisos de administrador necesarios para ver esta página.');
      } else {
        setError('Ocurrió un error al cargar los usuarios.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funciones para el modal (las usaremos luego)
  const handleUserUpdated = () => {
    setSelectedUser(null);
    fetchData();
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };


  if (loading) {
    return <Container><Text>Cargando usuarios...</Text></Container>;
  }

  if (error) {
    return (
      <Container size="md" my="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Acceso Denegado" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" my="md">
      <Title order={2} mb="xl">Panel de Administración de Usuarios</Title>
      
      <ScrollArea>
        <Table striped highlightOnHover withBorder verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Fecha Creación</Table.Th>
              <Table.Th>Activo</Table.Th>
              <Table.Th>Verificado</Table.Th>
              <Table.Th>Admin</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.nombre}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{new Date(user.created_at).toLocaleDateString()}</Table.Td>
                <Table.Td><Switch checked={user.is_active} readOnly /></Table.Td>
                <Table.Td><Switch checked={user.is_verified} readOnly /></Table.Td>
                <Table.Td><Switch checked={user.is_superuser} readOnly /></Table.Td>
                <Table.Td>
                  <Button variant="outline" size="xs" onClick={() => setSelectedUser(user)}>
                    Editar
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      
      {/* El modal para editar (lo crearemos a continuación) */}
      
      <GenericModal isOpen={!!selectedUser} onRequestClose={handleCloseModal}>
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
            onCancel={handleCloseModal}
          />
        )}
      </GenericModal>
      
    </Container>
  );
}

export default ManageUsers;