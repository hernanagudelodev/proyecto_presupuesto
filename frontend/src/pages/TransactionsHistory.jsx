import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Group } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function TransactionsHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lógica para buscar todas las transacciones
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Hacemos la petición a la API. Podemos añadir un límite más alto si es necesario.
      const response = await axiosInstance.get('/transacciones/?limit=100');
      setTransactions(response.data);
    } catch (err) {
      setError('No se pudo cargar el historial de transacciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Mapeamos las filas de la tabla a partir de los datos
  const rows = transactions.map((t) => (
    // Usamos el sub-componente <Table.Tr> para la fila
    <Table.Tr key={t.id}>
      {/* Usamos <Table.Td> para las celdas */}
      <Table.Td>{t.fecha}</Table.Td>
      <Table.Td>{t.descripcion}</Table.Td>
      <Table.Td>{t.tipo}</Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>${t.valor.toLocaleString()}</Table.Td>
      <Table.Td>
        {/* Espacio para los futuros botones de acción */}
        <Group spacing="xs">
          <Button variant="outline" color="blue" size="xs">Editar</Button>
          <Button variant="outline" color="red" size="xs">Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" my="md">
      <Title order={1} mb="xl">Historial de Transacciones</Title>

      {/* Usamos el componente <Table> de Mantine */}
      {/* Las propiedades como striped y withBorder se quedan en el componente principal <Table> */}
      <Table striped highlightOnHover>
        {/* Usamos los sub-componentes para el encabezado y el cuerpo */}
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
    </Container>
  );
}

export default TransactionsHistory;