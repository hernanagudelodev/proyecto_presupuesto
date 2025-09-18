import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Group, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import EditTransactionForm from '../components/EditTransactionForm'; // <-- Importamos el nuevo formulario de edición

function TransactionsHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NUEVOS ESTADOS PARA LAS ACCIONES ---
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
      const [transRes, accRes, catRes] = await Promise.all([
        axiosInstance.get('/transacciones/?limit=100'),
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

  // --- NUEVAS FUNCIONES PARA MANEJAR LAS ACCIONES ---

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

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Mapeamos las filas de la tabla a partir de los datos
  const rows = transactions.map((t) => (
    <Table.Tr key={t.id}>
      <Table.Td>{t.fecha}</Table.Td>
      <Table.Td>{t.descripcion}</Table.Td>
      <Table.Td>{t.tipo}</Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>${t.valor.toLocaleString()}</Table.Td>
      <Table.Td>
        {/* Espacio para los botones de acción, ahora funcionales */}
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
  ));

  return (
    <Container size="lg" my="md">
      <Title order={1} mb="xl">Historial de Transacciones</Title>

      {/* Usamos el componente <Table> de Mantine */}
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Fecha</Table.Th>
            <Table.Th>Descripción</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      
      {/* --- MODAL DINÁMICO PARA AMBAS ACCIONES --- */}
      <GenericModal
        isOpen={!!transactionToDelete || !!transactionToEdit}
        onRequestClose={() => {
          setTransactionToDelete(null);
          setTransactionToEdit(null);
        }}
      >
        {/* Contenido del modal para ELIMINAR */}
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
        
        {/* Contenido del modal para EDITAR */}
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