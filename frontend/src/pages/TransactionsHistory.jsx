import { useState, useEffect, useCallback } from 'react';
// Se elimina Tooltip y Box porque ya no se usarán con el botón de confirmar
import { Container, Title, Table, Button, Group, Text, Badge } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import EditTransactionForm from '../components/EditTransactionForm'; // <-- Importamos el formulario de edición

function TransactionsHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ESTADOS PARA LAS ACCIONES ---
  // Estado para guardar la transacción que se va a ELIMINAR
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  // Estado para guardar la transacción que se va a EDITAR
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  // Necesitamos los datos de cuentas y categorías para pasarlos al formulario de edición
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Lógica para buscar todas las transacciones (y ahora también cuentas y categorías)
  const fetchData = useCallback(async () => {
    // No reseteamos loading para que la recarga sea más suave
    try {
      // Hacemos todas las peticiones en paralelo para eficiencia
      // Aumentamos el límite para asegurarnos de traer todas las transacciones
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

  // --- FUNCIONES PARA MANEJAR LAS ACCIONES ---

  // NUEVO: Se elimina la función handleConfirmTransaction porque el botón ya no existe.
  
  // Se ejecuta al hacer clic en "Eliminar" en una fila
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction); // Guarda la transacción para la confirmación
  };
  
  // Se ejecuta al hacer clic en "Editar" en una fila
  const handleEditClick = (transaction) => {
    setTransactionToEdit(transaction); // Guarda la transacción y abre el modal de edición
  };

  // Se ejecuta al confirmar la eliminación en el modal
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await axiosInstance.delete(`/transacciones/${transactionToDelete.id}`);
      alert('¡Transacción eliminada!');
      setTransactionToDelete(null); // Cierra el modal
      fetchData(); // Recarga los datos
    } catch (err) {
      setError('No se pudo eliminar la transacción.');
    }
  };

  // Se ejecuta cuando el formulario de edición termina con éxito
  const handleTransactionUpdated = () => {
    setTransactionToEdit(null); // Cierra el modal
    fetchData(); // Recarga los datos
  };

  // --- LÓGICA COMPLETA PARA EL SALDO PROGRESIVO ---

  // 1. Ordenamos todas las transacciones por fecha, de la más reciente a la más antigua.
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // 2. Calculamos el saldo actual REAL (basado solo en transacciones confirmadas), que viene del backend.
  const confirmedTotalBalance = accounts.reduce((sum, account) => sum + account.saldo_actual, 0);

  // 3. Calculamos el impacto futuro de TODAS las transacciones que están en estado "Planeado".
  const plannedImpact = transactions
    .filter(t => t.estado === 'Planeado')
    .reduce((sum, t) => {
      if (t.tipo === 'Ingreso') return sum + t.valor;
      if (t.tipo === 'Gasto') return sum - t.valor;
      return sum;
    }, 0);

  // 4. El saldo inicial para nuestro cálculo es el saldo final proyectado.
  let runningBalance = confirmedTotalBalance + plannedImpact;

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // 5. Mapeamos las filas de la tabla y calculamos el saldo progresivo para cada una.
  const rows = sortedTransactions.map((t) => {
    const currentRunningBalance = runningBalance;
    
    // Aquí revertimos el efecto de la transacción para calcular el saldo de la fila ANTERIOR.
    // Nota: Las transferencias se ignoran a propósito porque no cambian el saldo TOTAL.
    if (t.tipo === 'Ingreso') {
      runningBalance -= t.valor;
    } else if (t.tipo === 'Gasto') {
      runningBalance += t.valor;
    }
    
    let accountDisplay = '-';
    if (t.tipo === 'Gasto' && !t.cuenta_origen_id) {
      accountDisplay = 'N/A';
    } else if (t.tipo === 'Gasto') {
      accountDisplay = t.cuenta_origen?.nombre || 'N/A';
    } else if (t.tipo === 'Ingreso') {
      accountDisplay = t.cuenta_destino?.nombre || 'N/A';
    } else if (t.tipo === 'Transferencia') {
      accountDisplay = `${t.cuenta_origen?.nombre || '?'} -> ${t.cuenta_destino?.nombre || '?'}`;
    }

    return (
    <Table.Tr key={t.id}>
      <Table.Td>{t.fecha}</Table.Td>
      <Table.Td>{t.descripcion}</Table.Td>
      <Table.Td>{t.tipo}</Table.Td>
      <Table.Td>{accountDisplay}</Table.Td>
      <Table.Td>
        <Badge color={t.estado === 'Confirmado' ? 'green' : 'yellow'}>
          {t.estado}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>${t.valor.toLocaleString()}</Table.Td>
      
      {/* NUEVO: Se añade un estilo condicional para cambiar el color del saldo */}
      <Table.Td 
        style={{ 
          textAlign: 'right', 
          fontWeight: 'bold',
          color: currentRunningBalance >= 0 ? 'green' : '#fa5252' // Verde para positivo/cero, rojo para negativo
        }}
      >
        ${currentRunningBalance.toLocaleString()}
      </Table.Td>
      
      <Table.Td>
        {/* NUEVO: Se ha eliminado completamente el botón "Confirmar" de esta vista. */}
        <Group spacing="xs">
          <Button variant="outline" color="blue" size="xs" onClick={() => handleEditClick(t)}>
            Editar
          </Button>
          <Button variant="outline" color="red" size="xs" onClick={() => handleDeleteClick(t)}>
            Eliminar
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  )});

  return (
    <Container size="xl" my="md">
      <Title order={1} mb="xl">Historial de Transacciones</Title>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Fecha</Table.Th>
            <Table.Th>Descripción</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Cuenta</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Saldo</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      
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