import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Button, Stack, Group, Paper, List, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddAccountForm from '../components/AddAccountForm';
import AddCategoryForm from '../components/AddCategoryForm';
import AddTransactionForm from '../components/AddTransactionForm'; // <-- 1. Importa el nuevo formulario

function Dashboard() {
  // --- ESTADOS PARA LOS DATOS ---
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]); // <-- Nuevo estado para transacciones

  // --- ESTADOS PARA LOS MODALES ---
  const [modalContent, setModalContent] = useState(null); // Un único estado para controlar el contenido del modal

  // --- ESTADOS DE CARGA Y ERROR ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LÓGICA DE BÚSQUEDA DE DATOS ---
  const fetchData = useCallback(async () => {
    // No reiniciamos 'loading' aquí para una recarga más suave
    try {
      // Hacemos las tres peticiones a la vez para máxima eficiencia
      const [accRes, catRes, transRes] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/'),
        axiosInstance.get('/transacciones/') // <-- Pide las transacciones
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      setTransactions(transRes.data); // <-- Guarda las transacciones
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MANEJO DE MODALES Y ACTUALIZACIÓN DE DATOS ---
  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  const handleItemAdded = () => {
    closeModal();
    fetchData(); // Recarga TODOS los datos (saldos de cuentas y lista de transacciones)
  };

  if (loading) return <p>Cargando tus datos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // --- RENDERIZADO DEL DASHBOARD CON COMPONENTES MANTINE Y TUS COMENTARIOS ---
  return (
    // <Container> centra el contenido y le da un ancho máximo
    <Container size="md" my="md">
      {/* <Stack> apila los elementos verticalmente con un espaciado consistente */}
      <Stack spacing="lg">
        
        {/* Usamos <Title> para el encabezado principal */}
        <Title order={1}>Tu Dashboard</Title>

        {/* Botón principal para la acción más común */}
        {/* Usamos el componente <Button> de Mantine */}
        <Button onClick={() => openModal('transaction')} size="md">
          Añadir Transacción
        </Button>

        {/* Sección de Transacciones */}
        {/* <Paper> crea una caja con borde y sombra para agrupar contenido */}
        <Paper withBorder shadow="sm" p="md">
          <Title order={2} mb="sm">Últimas Transacciones</Title>
          {transactions.length > 0 ? (
            <List spacing="xs" size="sm">
              {transactions.map(t => <List.Item key={t.id}>{t.fecha}: {t.descripcion} - ${t.valor.toLocaleString()} ({t.tipo})</List.Item>)}
            </List>
          ) : <Text color="dimmed">No tienes transacciones todavía.</Text>}
        </Paper>

        {/* Sección de Cuentas */}
        <Paper withBorder shadow="sm" p="md">
          {/* <Group position="apart"> alinea elementos a la izquierda y derecha */}
          <Group position="apart" mb="sm">
            <Title order={2}>Mis Cuentas</Title>
            <Button variant="outline" size="xs" onClick={() => openModal('account')}>Añadir Cuenta</Button>
          </Group>
          {accounts.length > 0 ? (
            <List spacing="xs" size="sm">
              {accounts.map(acc => <List.Item key={acc.id}><strong>{acc.nombre}</strong> - Saldo: ${acc.saldo_actual.toLocaleString()}</List.Item>)}
            </List>
          ) : <Text color="dimmed">Aún no tienes cuentas.</Text>}
        </Paper>

        {/* Sección de Categorías */}
        <Paper withBorder shadow="sm" p="md">
          <Group position="apart" mb="sm">
            <Title order={2}>Mis Categorías</Title>
            <Button variant="outline" size="xs" onClick={() => openModal('category')}>Añadir Categoría</Button>
          </Group>
          {categories.length > 0 ? (
            <List spacing="xs" size="sm">
              {categories.map(cat => <List.Item key={cat.id}><strong>{cat.nombre}</strong> ({cat.tipo})</List.Item>)}
            </List>
          ) : <Text color="dimmed">Aún no tienes categorías.</Text>}
        </Paper>
        
      </Stack>

      {/* --- MODAL ÚNICO Y DINÁMICO --- */}
      {/* Esta parte no cambia, ya que nuestro GenericModal es el que controla la apariencia del modal */}
      <GenericModal 
        isOpen={!!modalContent} 
        onRequestClose={closeModal}
      >
        {modalContent === 'transaction' && <AddTransactionForm accounts={accounts} categories={categories} onTransactionAdded={handleItemAdded} />}
        {modalContent === 'account' && <AddAccountForm onAccountAdded={handleItemAdded} />}
        {modalContent === 'category' && <AddCategoryForm onCategoryAdded={handleItemAdded} />}
      </GenericModal>
    </Container>
  );
}

export default Dashboard;