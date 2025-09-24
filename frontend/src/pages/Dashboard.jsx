import { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Title, Button, Stack, Group, Paper, List, Text, Divider } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddTransactionForm from '../components/AddTransactionForm';
import MonthlySummaryChart from '../components/MonthlySummaryChart';
import CategoryExpensesChart from '../components/CategoryExpensesChart';
import styles from './Dashboard.module.css'; // Importamos nuestro CSS

function Dashboard() {
  // --- Estados para los datos de la API ---
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [categoryExpenseData, setCategoryExpenseData] = useState([]);

  // --- Estados para los filtros de los gráficos ---
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  // --- Estados para la UI (modales, carga, errores) ---
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Lógica de Carga de Datos ---
  const fetchData = useCallback(async (year, month) => {
    setLoading(true);
    try {
      const [accRes, catRes, transRes, summaryRes, categoryRes] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/'),
        axiosInstance.get('/transacciones/?limit=10'),
        axiosInstance.get(`/dashboard/resumen-mensual/${year}`),
        axiosInstance.get(`/dashboard/gastos-por-categoria/${year}/${month}`)
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      setTransactions(transRes.data);
      setSummaryData(summaryRes.data);
      setCategoryExpenseData(categoryRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect se ejecuta cuando el año o el mes cambian, volviendo a cargar los datos
  useEffect(() => {
    fetchData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, fetchData]);

  // --- Cálculos Memorizados ---
  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.saldo_actual, 0), [accounts]);
  const latestConfirmedTransactions = useMemo(() => transactions.filter(t => t.estado === 'Confirmado').sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5), [transactions]);
  
  // --- Manejadores de Eventos ---
  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);
  const handleItemAdded = () => { closeModal(); fetchData(selectedYear, selectedMonth); };

  if (loading) return <p>Cargando tus datos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Container size="xl" my="md">
      <Stack spacing="xl">
        {/* Cabecera del Dashboard */}
        <Group position="apart">
          <Title order={1}>Tu Dashboard</Title>
          <Button onClick={() => openModal('transaction')} size="sm">Añadir Transacción</Button>
        </Group>

        {/* Contenedor principal del layout, controlado por nuestro CSS */}
        <div className={styles.gridContainer}>
          
          {/* --- ÁREA DE GRÁFICOS --- */}
          <div className={styles.chart1Area}>
            <MonthlySummaryChart data={summaryData} selectedYear={selectedYear} onYearChange={setSelectedYear} />
          </div>

          <div className={styles.chart2Area}>
            <CategoryExpensesChart 
              data={categoryExpenseData} 
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
          </div>
          
          {/* --- ÁREA DE RESÚMENES --- */}
          <div className={styles.accountsArea}>
            <Paper withBorder shadow="sm" p="md" className={styles.card}>
              <div> {/* Contenedor para la cabecera */}
                <Text size="lg" weight={700}>Mis Cuentas</Text>
                <Group position="apart" align="baseline" mt="xs">
                  <Text size="md" color="dimmed">Saldo Total Actual:</Text>
                  <Text fz="2rem" weight={700} color={totalBalance >= 0 ? 'teal' : 'red'}>${totalBalance.toLocaleString()}</Text>
                </Group>
                <Divider my="sm" />
              </div>
              <div className={styles.cardBody}> {/* Este div se estira */}
                {accounts.length > 0 ? (
                  <List spacing="xs" size="sm">{accounts.map(acc => (
                    <List.Item key={acc.id}><Group position="apart"><Text>{acc.nombre} ({acc.tipo})</Text><Text weight={500}>${acc.saldo_actual.toLocaleString()}</Text></Group></List.Item>
                  ))}</List>
                ) : <Text color="dimmed" pt="md">Aún no tienes cuentas.</Text>}
              </div>
            </Paper>
          </div>

          {/* ¡AQUÍ ESTÁ DE VUELTA LA TARJETA DE TRANSACCIONES! */}
          <div className={styles.transactionsArea}>
            <Paper withBorder shadow="sm" p="md" className={styles.card}>
              <div>
                <Text size="lg" weight={700} mb="sm">Últimas Transacciones (Confirmadas)</Text>
              </div>
              <div className={styles.cardBody}>
                {latestConfirmedTransactions.length > 0 ? (
                  <List spacing="xs" size="sm">{latestConfirmedTransactions.map(t => (
                    <List.Item key={t.id}><Group position="apart"><Text>{t.descripcion}</Text><Text color={t.tipo === 'Ingreso' ? 'green' : 'red'} weight={500}>{t.tipo === 'Ingreso' ? '+' : '-'} ${t.valor.toLocaleString()}</Text></Group></List.Item>
                  ))}</List>
                ) : <Text color="dimmed">No tienes transacciones confirmadas.</Text>}
              </div>
            </Paper>
          </div>

        </div>
      </Stack>

      {/* Modal para añadir transacciones */}
      <GenericModal isOpen={!!modalContent} onRequestClose={closeModal}>
        {modalContent === 'transaction' && <AddTransactionForm accounts={accounts} categories={categories} onTransactionAdded={handleItemAdded} />}
      </GenericModal>
    </Container>
  );
}

export default Dashboard;