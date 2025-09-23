import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Table, Button, Group, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import GenericModal from '../components/GenericModal';
import AddCategoryForm from '../components/AddCategoryForm';
import EditCategoryForm from '../components/EditCategoryForm'; // Importamos el formulario de edición

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para manejar los modales ('add' o 'edit')
  const [modalContent, setModalContent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchData = useCallback(async () => {
    // No reseteamos loading para recargas suaves
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

  // Se ejecuta cuando un formulario (crear o editar) termina con éxito
  const handleSuccess = () => {
    setModalContent(null);
    setSelectedCategory(null);
    fetchData(); // Recargamos la lista
  };
  
  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const rows = categories.map((cat) => (
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
  ));

  return (
    <Container size="md" my="md">
      <Group position="apart" mb="xl">
        <Title order={1}>Gestionar Categorías</Title>
        <Button onClick={() => setModalContent('add')}>Añadir Categoría</Button>
      </Group>

      {categories.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <Text>Aún no tienes categorías. ¡Crea la primera!</Text>
      )}


      <GenericModal isOpen={!!modalContent} onRequestClose={() => setModalContent(null)}>
        {modalContent === 'add' && <AddCategoryForm onCategoryAdded={handleSuccess} />}
        {modalContent === 'edit' && <EditCategoryForm category={selectedCategory} onCategoryUpdated={handleSuccess} />}
      </GenericModal>
    </Container>
  );
}

export default ManageCategories;