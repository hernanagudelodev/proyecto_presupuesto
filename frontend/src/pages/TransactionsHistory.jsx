import { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Title, Table, Button, Group, Text, Badge, Card, Stack, Divider, TextInput, MultiSelect, Paper, Center } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import EditTransactionForm from '../components/EditTransactionForm';

// Función auxiliar para obtener el rango del mes actual por defecto
const getInitialDateRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [firstDay, lastDay];
};

function TransactionsHistory() {
  // --- Estados para los datos de la API ---
  const [allTransactions, setAllTransactions] = useState([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // --- Estados para los filtros ---
  const [dateRange, setDateRange] = useState(getInitialDateRange());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // --- Estados para la UI (carga, errores, modales) ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  // 1. LÓGICA DE CARGA DE DATOS DESDE EL BACKEND
  const fetchDataForPeriod = useCallback(async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Llamamos al nuevo endpoint con los parámetros de fecha
      const response = await axiosInstance.get('/transacciones/', {
        params: { start_date: formattedStartDate, end_date: formattedEndDate },
      });
      
      // Guardamos el saldo inicial y las transacciones que nos llegan
      setAllTransactions(response.data.transacciones);
      setStartingBalance(response.data.saldo_inicial_periodo);

      // También cargamos las cuentas y categorías para los modales y filtros
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
  }, [dateRange]); // Se ejecuta cada vez que el rango de fechas cambia

  useEffect(() => {
    fetchDataForPeriod();
  }, [fetchDataForPeriod]);

  // 2. LÓGICA PARA FILTRAR LOCALMENTE
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = t.descripcion.toLowerCase().includes(searchTermLower);
      
      const categoryName = t.categoria ? t.categoria.nombre : '';
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(categoryName);
      
      return matchesSearch && matchesCategory;
    });
  }, [allTransactions, searchTerm, selectedCategories]);

  // 3. LÓGICA PARA CALCULAR EL SALDO CORRIENTE
  const runningBalanceMap = useMemo(() => {
    const balanceMap = new Map();
    let currentBalance = startingBalance;
    
    // IMPORTANTE: Ordenamos por fecha ASCENDENTE para calcular correctamente
    [...allTransactions]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha) || a.id - b.id)
      .forEach(t => {
        if (t.estado === 'Confirmado') {
          if (t.tipo === 'Ingreso') currentBalance += t.valor;
          if (t.tipo === 'Gasto') currentBalance -= t.valor;
          // Las transferencias no afectan el saldo total
        }
        balanceMap.set(t.id, currentBalance);
      });
    return balanceMap;
  }, [allTransactions, startingBalance]);

  // --- Manejadores de eventos (sin cambios mayores) ---
  const handleConfirmDelete = async () => { /* ...código de borrado... */ };
  const handleTransactionUpdated = () => {
    setTransactionToEdit(null);
    fetchDataForPeriod();
  };

  const categoryOptions = useMemo(() => [...new Set(categories.map(c => c.nombre))], [categories]);
  
  // --- VISTAS DE RENDERIZADO ---
  const renderRows = (transactionsToRender) => {
    return transactionsToRender.map((t) => {
        let accountDisplay = '-';
        if (t.tipo === 'Gasto') accountDisplay = t.cuenta_origen?.nombre || 'N/A';
        else if (t.tipo === 'Ingreso') accountDisplay = t.cuenta_destino?.nombre || 'N/A';
        else if (t.tipo === 'Transferencia') accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;
        
        const balance = runningBalanceMap.get(t.id) || 0;

        return isMobile ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={t.id}>
            <Group position="apart" mb="xs">
              <Text weight={500}>{t.descripcion}</Text>
              <Badge color={t.tipo === 'Ingreso' ? 'teal' : 'red'} size="lg">${t.valor.toLocaleString()}</Badge>
            </Group>
            <Text size="sm" color="dimmed"><strong>Fecha:</strong> {t.fecha}</Text>
            <Text size="sm" color="dimmed"><strong>Categoría:</strong> {t.categoria?.nombre || '-'}</Text>
            <Text size="sm" color="dimmed"><strong>Cuenta:</strong> {accountDisplay}</Text>
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
        ) : (
          <Table.Tr key={t.id}>
            <Table.Td>{t.fecha}</Table.Td>
            <Table.Td>{t.descripcion}</Table.Td>
            <Table.Td>{t.categoria?.nombre || '-'}</Table.Td>
            <Table.Td>{t.tipo}</Table.Td>
            <Table.Td>{accountDisplay}</Table.Td>
            <Table.Td><Badge color={t.estado === 'Confirmado' ? 'green' : 'yellow'}>{t.estado}</Badge></Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
              {t.tipo === 'Gasto' ? '-' : '+'} ${t.valor.toLocaleString()}
            </Table.Td>
            <Table.Td style={{ textAlign: 'right', fontWeight: 'bold', color: balance >= 0 ? 'green' : 'red' }}>${balance.toLocaleString()}</Table.Td>
            <Table.Td>
              <Group gap="xs">
                <Button variant="outline" size="xs" onClick={() => setTransactionToEdit(t)}>Editar</Button>
                <Button variant="outline" color="red" size="xs" onClick={() => setTransactionToDelete(t)}>Eliminar</Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        );
      });
  };

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
        isMobile ? (
          <Stack>{renderRows(filteredTransactions)}</Stack>
        ) : (
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
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
            <Table.Tbody>{renderRows(filteredTransactions)}</Table.Tbody>
          </Table>
        )
      )}

      <GenericModal isOpen={!!transactionToEdit || !!transactionToDelete} onRequestClose={() => {setTransactionToEdit(null); setTransactionToDelete(null);}}>
        {transactionToDelete && ( <div> {/* ...código del modal de borrado... */} </div> )}
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