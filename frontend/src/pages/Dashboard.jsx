import { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Title, Button, Stack, Group, Paper, List, Text, Divider } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddTransactionForm from '../components/AddTransactionForm';
// Importamos nuestro archivo de estilos
import styles from './Dashboard.module.css';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, catRes, transRes] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/'),
        axiosInstance.get('/transacciones/?limit=10')
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + account.saldo_actual, 0), [accounts]);
  const latestConfirmedTransactions = useMemo(() => transactions.filter(t => t.estado === 'Confirmado').sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5), [transactions]);

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);
  const handleItemAdded = () => { closeModal(); fetchData(); };

  if (loading) return <p>Cargando tus datos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Container size="lg" my="md">
      <Stack spacing="lg">
        <Group position="apart">
          <Title order={1}>Tu Dashboard</Title>
          <Button onClick={() => openModal('transaction')} size="sm">Añadir Transacción</Button>
        </Group>

        <div className={styles.gridContainer}>
          {/* Tarjeta de Cuentas */}
          <Paper withBorder shadow="sm" p="md" className={styles.card}>
            <div> {/* Contenedor para la cabecera */}
              <Text size="lg" weight={700}>Mis Cuentas</Text>
              <Group position="apart" align="baseline" mt="xs">
                <Text size="md" color="dimmed">Saldo Total Actual:</Text>
                <Text fz="2rem" weight={700} color={totalBalance >= 0 ? 'teal' : 'red'}>${totalBalance.toLocaleString()}</Text>
              </Group>
              <Divider my="sm" />
            </div>
            <div className={styles.cardBody}>
              {accounts.length > 0 ? (
                <List spacing="xs" size="sm">
                  {accounts.map(acc => (
                    <List.Item key={acc.id}>
                      <Group position="apart">
                        <Text>{acc.nombre} ({acc.tipo})</Text>
                        <Text weight={500}>${acc.saldo_actual.toLocaleString()}</Text>
                      </Group>
                    </List.Item>
                  ))}
                </List>
              ) : <Text color="dimmed">Aún no tienes cuentas.</Text>}
            </div>
          </Paper>

          {/* Tarjeta de Transacciones */}
          <Paper withBorder shadow="sm" p="md" className={styles.card}>
            <div> {/* Contenedor para la cabecera */}
              <Text size="lg" weight={700} mb="sm">Últimas Transacciones (Confirmadas)</Text>
            </div>
            <div className={styles.cardBody}>
              {latestConfirmedTransactions.length > 0 ? (
                <List spacing="xs" size="sm">
                  {latestConfirmedTransactions.map(t => (
                    <List.Item key={t.id}>
                      <Group position="apart">
                        <Text>{t.descripcion}</Text>
                        <Text color={t.tipo === 'Ingreso' ? 'green' : 'red'} weight={500}>
                          {t.tipo === 'Ingreso' ? '+' : '-'} ${t.valor.toLocaleString()}
                        </Text>
                      </Group>
                    </List.Item>
                  ))}
                </List>
              ) : <Text color="dimmed">No tienes transacciones confirmadas.</Text>}
            </div>
          </Paper>
        </div>
      </Stack>

      <GenericModal isOpen={!!modalContent} onRequestClose={closeModal}>
        {modalContent === 'transaction' && <AddTransactionForm accounts={accounts} categories={categories} onTransactionAdded={handleItemAdded} />}
      </GenericModal>
    </Container>
  );
}

export default Dashboard;