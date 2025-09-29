import { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Title, Table, Button, Group, Text, Badge, Card, Stack, Divider, TextInput, MultiSelect, Paper, Center } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import EditTransactionForm from '../components/EditTransactionForm';

const getInitialDateRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [firstDay, lastDay];
};

function TransactionsHistory() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(getInitialDateRange());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const fetchDataForPeriod = useCallback(async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await axiosInstance.get('/transacciones/', {
        params: { start_date: formattedStartDate, end_date: formattedEndDate },
      });
      
      setAllTransactions(response.data.transacciones);
      setStartingBalance(response.data.saldo_inicial_periodo);

      const [accRes, catRes] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/'),
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);

    } catch (err) {
      setError('No se pudo cargar el historial de transacciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDataForPeriod();
  }, [fetchDataForPeriod]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = t.descripcion.toLowerCase().includes(searchTermLower);
      const categoryName = t.categoria ? t.categoria.nombre : '';
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(categoryName);
      return matchesSearch && matchesCategory;
    });
  }, [allTransactions, searchTerm, selectedCategories]);

  const runningBalanceMap = useMemo(() => {
    const balanceMap = new Map();
    let currentBalance = startingBalance;
    [...allTransactions]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha) || a.id - b.id)
      .forEach(t => {
        if (t.estado === 'Confirmado') {
          if (t.tipo === 'Ingreso') currentBalance += t.valor;
          if (t.tipo === 'Gasto') currentBalance -= t.valor;
        }
        balanceMap.set(t.id, currentBalance);
      });
    return balanceMap;
  }, [allTransactions, startingBalance]);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await axiosInstance.delete(`/transacciones/${transactionToDelete.id}`);
      alert('¡Transacción eliminada!');
      setTransactionToDelete(null);
      fetchDataForPeriod();
    } catch (err) {
      setError('No se pudo eliminar la transacción.');
    }
  };

  const handleTransactionUpdated = () => {
    setTransactionToEdit(null);
    fetchDataForPeriod();
  };

  const categoryOptions = useMemo(() => [...new Set(categories.map(c => c.nombre))], [categories]);
  
  // --- VISTAS DE RENDERIZADO ---
  const DesktopView = (
    <Table striped highlightOnHover withBorder verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Fecha</Table.Th>
          <Table.Th>Descripción</Table.Th>
          <Table.Th>Categoría</Table.Th>
          <Table.Th>Cuenta</Table.Th>
          <Table.Th>Estado</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Saldo Corriente</Table.Th>
          <Table.Th>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {filteredTransactions.map((t) => {
          let accountDisplay = '-';
          if (t.tipo === 'Gasto') accountDisplay = t.cuenta_origen?.nombre || 'N/A';
          else if (t.tipo === 'Ingreso') accountDisplay = t.cuenta_destino?.nombre || 'N/A';
          else if (t.tipo === 'Transferencia') accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;
          const balance = runningBalanceMap.get(t.id) || 0;

          return (
            <Table.Tr key={t.id}>
              <Table.Td>{t.fecha}</Table.Td>
              <Table.Td>{t.descripcion}</Table.Td>
              <Table.Td>{t.categoria?.nombre || '-'}</Table.Td>
              <Table.Td>{accountDisplay}</Table.Td>
              <Table.Td><Badge color={t.estado === 'Confirmado' ? 'green' : 'yellow'}>{t.estado}</Badge></Table.Td>
              <Table.Td style={{ textAlign: 'right', color: t.tipo === 'Ingreso' ? 'green' : 'red' }}>
                {t.tipo === 'Ingreso' ? '+' : '-'} ${t.valor.toLocaleString()}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right', fontWeight: 'bold', color: balance >= 0 ? 'inherit' : 'red' }}>
                ${balance.toLocaleString()}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button variant="outline" size="xs" onClick={() => setTransactionToEdit(t)}>Editar</Button>
                  <Button variant="outline" color="red" size="xs" onClick={() => setTransactionToDelete(t)}>Eliminar</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );

  const MobileView = (
    <Stack>
      {filteredTransactions.map((t) => {
        let accountDisplay = '-';
        if (t.tipo === 'Gasto') accountDisplay = t.cuenta_origen?.nombre || 'N/A';
        else if (t.tipo === 'Ingreso') accountDisplay = t.cuenta_destino?.nombre || 'N/A';
        else if (t.tipo === 'Transferencia') accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;
        const balance = runningBalanceMap.get(t.id) || 0;

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
              <Text size="sm" weight={500}>Saldo en ese momento:</Text>
              <Text weight={700} color={balance >= 0 ? 'green' : 'red'}>${balance.toLocaleString()}</Text>
            </Group>
            <Group position="right" mt="md">
              <Button variant="outline" size="xs" onClick={() => setTransactionToEdit(t)}>Editar</Button>
              <Button variant="outline" color="red" size="xs" onClick={() => setTransactionToDelete(t)}>Eliminar</Button>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );

  return (
    <Container size="xl" my="md">
      <Title order={1} mb="xl">Historial de Transacciones</Title>
      
      <Paper withBorder shadow="sm" p="md" mb="xl">
        <Group grow align="flex-end">
          <DatePickerInput
            type="range"
            label="Selecciona un período"
            placeholder="Elige un rango de fechas"
            value={dateRange}
            onChange={setDateRange}
            maw={400}
          />
          <TextInput
            label="Buscar por descripción"
            placeholder="Café, salario, etc."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
          />
          <MultiSelect
            label="Filtrar por categoría"
            data={categoryOptions}
            placeholder="Todas las categorías"
            value={selectedCategories}
            onChange={setSelectedCategories}
            clearable
          />
        </Group>
      </Paper>
      
      {loading && <Center><Text>Cargando historial...</Text></Center>}
      {error && <Text color="red">{error}</Text>}
      
      {!loading && !error && (
        <>
          {isMobile ? <MobileView /> : <DesktopView />}
        </>
      )}

      <GenericModal isOpen={!!transactionToEdit || !!transactionToDelete} onRequestClose={() => {setTransactionToEdit(null); setTransactionToDelete(null);}}>
        {transactionToDelete && (
          <div>
            <Title order={3}>Confirmar Eliminación</Title>
            <Text mt="md">¿Estás seguro de que quieres eliminar la transacción: <strong>"{transactionToDelete.descripcion}"</strong>?</Text>
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