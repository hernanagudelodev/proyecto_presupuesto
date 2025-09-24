import { useState, useEffect, useCallback } from 'react';
// 1. Importamos los componentes necesarios
import { Container, Title, Table, Button, Group, Text, Card, Stack, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddAccountForm from '../components/AddAccountForm';
import EditAccountForm from '../components/EditAccountForm';

function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // 2. Hook para detectar si es una pantalla móvil
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // 3. VISTA PARA ESCRITORIO (LA TABLA)
  const DesktopView = (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Tipo</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Saldo Inicial</Table.Th>
          <Table.Th>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {accounts.map((acc) => (
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
        ))}
      </Table.Tbody>
    </Table>
  );

  // 4. NUEVA VISTA PARA MÓVIL (TARJETAS)
  const MobileView = (
    <Stack>
      {accounts.map((acc) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder key={acc.id}>
          <Group position="apart">
            <div>
              <Text weight={500}>{acc.nombre}</Text>
              <Text size="sm" color="dimmed">Tipo: {acc.tipo}</Text>
            </div>
            <Badge color="blue" variant="light">
              Saldo Inicial: ${acc.saldo_inicial.toLocaleString()}
            </Badge>
          </Group>
          <Button variant="outline" size="xs" fullWidth mt="md" onClick={() => { setSelectedAccount(acc); setModalContent('edit'); }}>
            Editar
          </Button>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Container size="md" my="md">
      <Group position="apart" mb="xl">
        <Title order={1}>Gestionar Cuentas</Title>
        <Button onClick={() => setModalContent('add')}>Añadir Cuenta</Button>
      </Group>

      {/* 5. EL INTERRUPTOR MÁGICO */}
      {accounts.length > 0
        ? (isMobile ? MobileView : DesktopView)
        : <Text>Aún no tienes cuentas. ¡Crea la primera!</Text>
      }

      <GenericModal isOpen={!!modalContent} onRequestClose={() => setModalContent(null)}>
        {modalContent === 'add' && <AddAccountForm onAccountAdded={handleSuccess} />}
        {modalContent === 'edit' && <EditAccountForm account={selectedAccount} onAccountUpdated={handleSuccess} />}
      </GenericModal>
    </Container>
  );
}

export default ManageAccounts;