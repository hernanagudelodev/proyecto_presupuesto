import { useState, useEffect, useCallback, useMemo } from 'react';
// 1. Importamos Card, Stack, Badge y el hook useMediaQuery
import { Container, Title, Table, Button, Group, Text, Select, NumberInput, Card, Stack, Badge, TextInput, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddRuleForm from '../components/AddRuleForm';
import EditRuleForm from '../components/EditRuleForm';

function RecurringRules() {
  // --- Estados y hooks ---
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [planningMonth, setPlanningMonth] = useState(String(new Date().getMonth() + 1));
  const [planningYear, setPlanningYear] = useState(new Date().getFullYear());
  // --- NUEVOS ESTADOS PARA FILTRO Y ORDEN ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'descripcion', direction: 'asc' });

  // 2. Hook para detectar el tamaño de la pantalla
  const isMobile = useMediaQuery('(max-width: 768px)');

  // --- NUEVO: Lógica de Filtro y Ordenamiento ---
  const filteredAndSortedRules = useMemo(() => {
    const filtered = rules.filter(rule =>
      // 1. Filtramos por la descripción (ignorando mayúsculas/minúsculas)
      rule.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Ordenamos el resultado del filtro
    const sorted = [...filtered].sort((a, b) => {
      // Manejo simple para ordenar por strings o números
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [rules, searchTerm, sortConfig]); // Se recalcula si cambian las reglas, la búsqueda o el orden

  // --- NUEVO: Función para cambiar el orden ---
  const requestSort = (key) => {
    let direction = 'asc';
    // Si ya estamos ordenando por esta columna, invertimos la dirección
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchData = useCallback(async () => {
    try {
      const [rulesRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/reglas-recurrentes/'),
        axiosInstance.get('/categorias/')
      ]);
      setRules(rulesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Manejadores de acciones (sin cambios) ---
  const handleActionSuccess = () => {
    setModalContent(null);
    setSelectedRule(null);
    fetchData();
  };
  
  const handleGeneratePlanned = async () => {
    try {
      const response = await axiosInstance.post(`/reglas-recurrentes/generar-transacciones/${planningYear}/${planningMonth}`);
      // ¡AQUÍ ESTÁ EL CAMBIO! Leemos la propiedad `transacciones_generadas`
      const count = response.data.transacciones_generadas; 
      alert(`¡${count} transacciones planeadas para ${planningMonth}/${planningYear} generadas exitosamente!`);
      setModalContent(null);
    } catch (err) {
      alert('Error al generar las transacciones planeadas.');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRule) return;
    try {
      await axiosInstance.delete(`/reglas-recurrentes/${selectedRule.id}`);
      alert('¡Regla eliminada!');
      handleActionSuccess();
    } catch (err) {
      alert('No se pudo eliminar la regla.');
    }
  };

  if (loading) return <p>Cargando reglas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // --- 3. VISTA PARA ESCRITORIO (LA TABLA) ---
  const DesktopView = (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th onClick={() => requestSort('descripcion')} style={{ cursor: 'pointer' }}>
            Descripción {sortConfig.key === 'descripcion' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
          </Table.Th>
          <Table.Th onClick={() => requestSort('tipo')} style={{ cursor: 'pointer' }}>
            Tipo {sortConfig.key === 'tipo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
          </Table.Th>
          <Table.Th onClick={() => requestSort('valor_predeterminado')} style={{ textAlign: 'right', cursor: 'pointer' }}>
            Valor {sortConfig.key === 'valor_predeterminado' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
          </Table.Th>
          <Table.Th onClick={() => requestSort('frecuencia')} style={{ cursor: 'pointer' }}>
            Frecuencia {sortConfig.key === 'frecuencia' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
          </Table.Th>
          <Table.Th>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {/* --- USAMOS LA NUEVA LISTA --- */}
        {filteredAndSortedRules.map((rule) => (
          <Table.Tr key={rule.id}>
            <Table.Td>{rule.descripcion}</Table.Td>
            <Table.Td>{rule.tipo}</Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>${rule.valor_predeterminado.toLocaleString()}</Table.Td>
            <Table.Td>{rule.frecuencia}</Table.Td>
            <Table.Td>
              <Group spacing="xs">
                <Button variant="outline" color="blue" size="xs" onClick={() => { setSelectedRule(rule); setModalContent('edit'); }}>Editar</Button>
                <Button variant="outline" color="red" size="xs" onClick={() => { setSelectedRule(rule); setModalContent('delete'); }}>Eliminar</Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );

  // --- 4. NUEVA VISTA PARA MÓVIL (TARJETAS) ---
  const MobileView = (
    <Stack>
      {/* --- USAMOS LA NUEVA LISTA --- */}
      {filteredAndSortedRules.map((rule) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder key={rule.id}>
          <Group position="apart" mb="xs">
            <Text weight={500}>{rule.descripcion}</Text>
            <Badge color={rule.tipo === 'Ingreso' ? 'teal' : 'pink'} size="lg">
              ${rule.valor_predeterminado.toLocaleString()}
            </Badge>
          </Group>
          <Text size="sm" color="dimmed">
            <strong>Tipo:</strong> {rule.tipo}
          </Text>
          <Text size="sm" color="dimmed">
            <strong>Frecuencia:</strong> {rule.frecuencia}
          </Text>
          <Group position="right" mt="md">
            <Button variant="outline" color="blue" size="xs" onClick={() => { setSelectedRule(rule); setModalContent('edit'); }}>Editar</Button>
            <Button variant="outline" color="red" size="xs" onClick={() => { setSelectedRule(rule); setModalContent('delete'); }}>Eliminar</Button>
          </Group>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Container size="lg" my="md">
      <Group position="apart" mb="xl">
        <Title order={1}>Reglas Recurrentes</Title>
        <Group>
          <Button onClick={() => setModalContent('plan')}>Planificar un Mes</Button>
          <Button onClick={() => setModalContent('add')}>Crear Nueva Regla</Button>
        </Group>
      </Group>
      <Paper withBorder shadow="sm" p="md" mb="xl">
        <TextInput
          placeholder="Buscar por descripción..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </Paper>

      {/* --- LÓGICA DE RENDERIZADO ACTUALIZADA --- */}
      {/* Primero, revisamos si la lista ORIGINAL está vacía */}
      {rules.length === 0 ? (
        <Text mt="lg">No tienes reglas recurrentes todavía.</Text>
      ) : 
      // Si hay reglas, revisamos si la lista FILTRADA está vacía
      filteredAndSortedRules.length === 0 ? (
        <Text mt="lg" align="center">No se encontraron reglas que coincidan con tu búsqueda.</Text>
      ) : (
        // Si hay resultados en la lista filtrada, los mostramos
        isMobile ? MobileView : DesktopView
      )}

      {/* El modal no necesita cambios, seguirá funcionando igual */}
      <GenericModal
        isOpen={!!modalContent}
        onRequestClose={() => setModalContent(null)}
      >
        {modalContent === 'add' && <AddRuleForm categories={categories} onRuleAdded={handleActionSuccess} />}
        {modalContent === 'edit' && <EditRuleForm rule={selectedRule} categories={categories} onRuleUpdated={handleActionSuccess} />}
        {modalContent === 'delete' && (
          <div>
            <Title order={3}>Confirmar Eliminación</Title>
            <Text mt="md">¿Estás seguro de que quieres eliminar la regla: <strong>"{selectedRule?.descripcion}"</strong>?</Text>
            <Group position="right" mt="xl">
              <Button variant="default" onClick={() => setModalContent(null)}>Cancelar</Button>
              <Button color="red" onClick={handleConfirmDelete}>Sí, eliminar</Button>
            </Group>
          </div>
        )}
        {modalContent === 'plan' && (
          <div>
            <Title order={3}>Planificar Transacciones</Title>
            <Text mt="md" mb="lg">Selecciona el mes y el año para generar las transacciones planeadas a partir de tus reglas.</Text>
            <Group grow>
              <Select
                label="Mes"
                data={[
                  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
                  { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
                  { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
                  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
                  { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
                  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
                ]}
                value={planningMonth}
                onChange={setPlanningMonth}
              />
              <NumberInput
                label="Año"
                value={planningYear}
                onChange={setPlanningYear}
              />
            </Group>
            <Group position="right" mt="xl">
              <Button variant="default" onClick={() => setModalContent(null)}>Cancelar</Button>
              <Button onClick={handleGeneratePlanned}>Generar</Button>
            </Group>
          </div>
        )}
      </GenericModal>
    </Container>
  );
}

export default RecurringRules;