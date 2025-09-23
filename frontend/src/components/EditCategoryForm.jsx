import { useState } from 'react';
import { TextInput, Select, Button, Stack, Title, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function EditCategoryForm({ category, onCategoryUpdated }) {
  const [nombre, setNombre] = useState(category.nombre);
  const [tipo, setTipo] = useState(category.tipo);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await axiosInstance.put(`/categorias/${category.id}`, { nombre, tipo });
      alert('¡Categoría actualizada!');
      onCategoryUpdated();
    } catch (err) {
      setError('No se pudo actualizar la categoría.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Editar Categoría</Title>
        <TextInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} required />
        <Select label="Tipo" data={['Gasto', 'Ingreso']} value={tipo} onChange={setTipo} required />
        {error && <Text color="red" size="sm">{error}</Text>}
        <Button type="submit" fullWidth mt="md">Guardar Cambios</Button>
      </Stack>
    </form>
  );
}
export default EditCategoryForm;