import { useState, useEffect, useCallback } from 'react';
// 1. Importamos los componentes necesarios
import { Container, Title, Table, Button, Group, Text, Card, Stack, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddCategoryForm from '../components/AddCategoryForm';
import EditCategoryForm from '../components/EditCategoryForm';

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 2. Hook para detectar si es una pantalla móvil
  const isMobile = useMediaQuery('(max-width: 768px)');

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/categorias/');
      setCategories(response.data);
    } catch (err) {
      setError('No se pudieron cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setModalContent(null);
    setSelectedCategory(null);
    fetchData();
  };
  
  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // 3. VISTA PARA ESCRITORIO (LA TABLA)
  const DesktopView = (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Tipo</Table.Th>
          <Table.Th>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {categories.map((cat) => (
          <Table.Tr key={cat.id}>
            <Table.Td>{cat.nombre}</Table.Td>
            <Table.Td>{cat.tipo}</Table.Td>
            <Table.Td>
              <Group spacing="xs">
                <Button 
                  variant="outline" 
                  size="xs" 
                  onClick={() => { 
                    setSelectedCategory(cat); 
                    setModalContent('edit'); 
                  }}
                >
                  Editar
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );

  // 4. NUEVA VISTA PARA MÓVIL (TARJETAS)
  const MobileView = (
    <Stack>
      {categories.map((cat) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder key={cat.id}>
          <Group position="apart">
            <Text weight={500}>{cat.nombre}</Text>
            <Badge color={cat.tipo === 'Ingreso' ? 'green' : 'orange'} variant="light">
              {cat.tipo}
            </Badge>
          </Group>
          <Button 
            variant="outline" 
            size="xs" 
            fullWidth 
            mt="md"
            onClick={() => { 
              setSelectedCategory(cat); 
              setModalContent('edit'); 
            }}
          >
            Editar
          </Button>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Container size="md" my="md">
      <Group position="apart" mb="xl">
        <Title order={1}>Gestionar Categorías</Title>
        <Button onClick={() => setModalContent('add')}>Añadir Categoría</Button>
      </Group>

      {/* 5. EL INTERRUPTOR MÁGICO */}
      {categories.length > 0
        ? (isMobile ? MobileView : DesktopView)
        : <Text mt="lg">Aún no tienes categorías. ¡Crea la primera!</Text>
      }

      <GenericModal isOpen={!!modalContent} onRequestClose={() => setModalContent(null)}>
        {modalContent === 'add' && <AddCategoryForm onCategoryAdded={handleSuccess} />}
        {modalContent === 'edit' && <EditCategoryForm category={selectedCategory} onCategoryUpdated={handleSuccess} />}
      </GenericModal>
    </Container>
  );
}

export default ManageCategories;