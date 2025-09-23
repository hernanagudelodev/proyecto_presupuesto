// Esta página mostrará la lista de cuentas y permitirá editarlas/crearlas
import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Group, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddAccountForm from '../components/AddAccountForm';
// Necesitaremos un nuevo formulario para editar, lo crearemos a continuación
// import EditAccountForm from '../components/EditAccountForm';

function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para manejar los modales ('add' o 'edit')
  const [modalContent, setModalContent] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/cuentas/');
      setAccounts(response.data);
    } catch (err) {
      setError('No se pudieron cargar las cuentas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setModalContent(null);
    setSelectedAccount(null);
    fetchData();
  };

  if (loading) return <p>Cargando cuentas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const rows = accounts.map((acc) => (
    <Table.Tr key={acc.id}>
      <Table.Td>{acc.nombre}</Table.Td>
      <Table.Td>{acc.tipo}</Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>${acc.saldo_inicial.toLocaleString()}</Table.Td>
      <Table.Td>
        <Group spacing="xs">
          <Button variant="outline" size="xs" onClick={() => { setSelectedAccount(acc); setModalContent('edit'); }}>
            Editar
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md" my="md">
      <Group position="apart" mb="xl">
        <Title order={1}>Gestionar Cuentas</Title>
        <Button onClick={() => setModalContent('add')}>Añadir Cuenta</Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Saldo Inicial</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <GenericModal isOpen={!!modalContent} onRequestClose={() => setModalContent(null)}>
        {modalContent === 'add' && <AddAccountForm onAccountAdded={handleSuccess} />}
        {/* {modalContent === 'edit' && <EditAccountForm account={selectedAccount} onAccountUpdated={handleSuccess} />} */}
      </GenericModal>
    </Container>
  );
}

export default ManageAccounts;