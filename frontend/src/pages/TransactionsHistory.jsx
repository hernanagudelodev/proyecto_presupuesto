import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Group, Text, Badge, Card, Stack, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import EditTransactionForm from '../components/EditTransactionForm';

function TransactionsHistory() {
  // --- Estados y hooks ---
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // --- Lógica de carga de datos ---
  const fetchData = useCallback(async () => {
    try {
      const [transRes, accRes, catRes] = await Promise.all([
        axiosInstance.get('/transacciones/?limit=1000'),
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/')
      ]);
      setTransactions(transRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError('No se pudo cargar el historial de transacciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Manejadores de acciones ---
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
  };
  
  const handleEditClick = (transaction) => {
    setTransactionToEdit(transaction);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await axiosInstance.delete(`/transacciones/${transactionToDelete.id}`);
      alert('¡Transacción eliminada!');
      setTransactionToDelete(null);
      fetchData();
    } catch (err) {
      setError('No se pudo eliminar la transacción.');
    }
  };

  const handleTransactionUpdated = () => {
    setTransactionToEdit(null);
    fetchData();
  };

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // --- Lógica de cálculo de saldo ---
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const confirmedTotalBalance = accounts.reduce((sum, account) => sum + account.saldo_actual, 0);
  const plannedImpact = transactions
    .filter(t => t.estado === 'Planeado')
    .reduce((sum, t) => {
      if (t.tipo === 'Ingreso') return sum + t.valor;
      if (t.tipo === 'Gasto') return sum - t.valor;
      return sum;
    }, 0);

  let desktopRunningBalance = confirmedTotalBalance + plannedImpact;
  let mobileRunningBalance = confirmedTotalBalance + plannedImpact;

  // --- VISTA PARA ESCRITORIO (TABLA) ---
  const DesktopView = (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Fecha</Table.Th>
          <Table.Th>Descripción</Table.Th>
          <Table.Th>Categoría</Table.Th>
          <Table.Th>Tipo</Table.Th>
          <Table.Th>Cuenta</Table.Th>
          <Table.Th>Estado</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Saldo</Table.Th>
          <Table.Th>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedTransactions.map((t) => {
          const currentRunningBalance = desktopRunningBalance;
          if (t.tipo === 'Ingreso') {
            desktopRunningBalance -= t.valor;
          } else if (t.tipo === 'Gasto') {
            desktopRunningBalance += t.valor;
          }
          
          let accountDisplay = '-';
          if (t.tipo === 'Gasto') accountDisplay = t.cuenta_origen?.nombre || 'N/A';
          else if (t.tipo === 'Ingreso') accountDisplay = t.cuenta_destino?.nombre || 'N/A';
          else if (t.tipo === 'Transferencia') accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;

          return (
            <Table.Tr key={t.id}>
              <Table.Td>{t.fecha}</Table.Td>
              <Table.Td>{t.descripcion}</Table.Td>
              <Table.Td>{t.categoria?.nombre || '-'}</Table.Td>
              <Table.Td>{t.tipo}</Table.Td>
              <Table.Td>{accountDisplay}</Table.Td>
              <Table.Td><Badge color={t.estado === 'Confirmado' ? 'green' : 'yellow'}>{t.estado}</Badge></Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>${t.valor.toLocaleString()}</Table.Td>
              <Table.Td 
                style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  color: currentRunningBalance >= 0 ? 'green' : '#fa5252'
                }}
              >
                ${currentRunningBalance.toLocaleString()}
              </Table.Td>
              <Table.Td>
                <Group spacing="xs">
                  <Button variant="outline" color="blue" size="xs" onClick={() => handleEditClick(t)}>Editar</Button>
                  <Button variant="outline" color="red" size="xs" onClick={() => handleDeleteClick(t)}>Eliminar</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
  
  // --- VISTA PARA MÓVIL (TARJETAS) ---
  const MobileView = (
    <Stack>
      {sortedTransactions.map((t) => {
        const currentRunningBalance = mobileRunningBalance;
        if (t.tipo === 'Ingreso') {
          mobileRunningBalance -= t.valor;
        } else if (t.tipo === 'Gasto') {
          mobileRunningBalance += t.valor;
        }

        let accountDisplay = '-';
        if (t.tipo === 'Gasto') accountDisplay = t.cuenta_origen?.nombre || 'N/A';
        else if (t.tipo === 'Ingreso') accountDisplay = t.cuenta_destino?.nombre || 'N/A';
        else if (t.tipo === 'Transferencia') accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;

        return (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={t.id}>
            <Group position="apart" mb="xs">
              <Text weight={500}>{t.descripcion}</Text>
              <Badge color={t.tipo === 'Ingreso' ? 'teal' : 'red'} size="lg">
                ${t.valor.toLocaleString()}
              </Badge>
            </Group>
            
            <Text size="sm" color="dimmed"><strong>Fecha:</strong> {t.fecha} | <strong>Tipo:</strong> {t.tipo}</Text>
            <Text size="sm" color="dimmed"><strong>Categoría:</strong> {t.categoria?.nombre || '-'}</Text>
            <Text size="sm" color="dimmed"><strong>Cuenta:</strong> {accountDisplay}</Text>
            <Text component="div" size="sm" color="dimmed"> 
              <strong>Estado:</strong> <Badge size="sm" color={t.estado === 'Confirmado' ? 'green' : 'yellow'}>{t.estado}</Badge>
            </Text>

            <Divider my="xs" />
            <Group position="apart">
              <Text size="sm" weight={500}>Saldo:</Text>
              <Text 
                weight={700} 
                color={currentRunningBalance >= 0 ? 'green' : 'red'}
              >
                ${currentRunningBalance.toLocaleString()}
              </Text>
            </Group>

            <Group position="right" mt="md">
              <Button variant="outline" color="blue" size="xs" onClick={() => handleEditClick(t)}>Editar</Button>
              <Button variant="outline" color="red" size="xs" onClick={() => handleDeleteClick(t)}>Eliminar</Button>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );

  return (
    <Container size="xl" my="md">
      <Title order={1} mb="xl">Historial de Transacciones</Title>
      
      {isMobile ? MobileView : DesktopView}

      <GenericModal
        isOpen={!!transactionToDelete || !!transactionToEdit}
        onRequestClose={() => {
          setTransactionToDelete(null);
          setTransactionToEdit(null);
        }}
      >
        {transactionToDelete && (
          <div>
            <Title order={3}>Confirmar Eliminación</Title>
            <Text mt="md">
              ¿Estás seguro de que quieres eliminar la transacción: <strong>"{transactionToDelete.descripcion}"</strong>?
            </Text>
            <Group position="right" mt="xl">
              <Button variant="default" onClick={() => setTransactionToDelete(null)}>Cancelar</Button>
              <Button color="red" onClick={handleConfirmDelete}>Sí, eliminar</Button>
            </Group>
          </div>
        )}
        
        {transactionToEdit && (
          <EditTransactionForm
            transaction={transactionToEdit}
            accounts={accounts}
            categories={categories}
            onTransactionUpdated={handleTransactionUpdated}
          />
        )}
      </GenericModal>
    </Container>
  );
}

export default TransactionsHistory;