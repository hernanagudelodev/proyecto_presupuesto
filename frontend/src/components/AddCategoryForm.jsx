import { useState } from 'react';
import { TextInput, Select, Button, Stack, Title, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function AddCategoryForm({ onCategoryAdded }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Gasto'); // Valor por defecto
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const newCategory = { nombre, tipo };
      await axiosInstance.post('/categorias/', newCategory);

      alert('¡Categoría creada exitosamente!');
      setNombre('');
      setTipo('Gasto');
      onCategoryAdded();

    } catch (err) {
      setError('No se pudo crear la categoría.');
      console.error(err);
    }
  };

  // --- RENDERIZADO CON COMPONENTES DE MANTINE ---
  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Añadir Nueva Categoría</Title>

        <TextInput
          label="Nombre de la Categoría"
          placeholder="Ej: Mercado, Salario"
          value={nombre}
          onChange={(event) => setNombre(event.currentTarget.value)}
          required
        />

        {/* Usamos el componente Select de Mantine */}
        <Select
          label="Tipo"
          data={[
            { value: 'Gasto', label: 'Gasto' },
            { value: 'Ingreso', label: 'Ingreso' },
          ]}
          value={tipo}
          onChange={setTipo} // El Select de Mantine devuelve el 'value' directamente
          required
        />

        {error && <Text color="red" size="sm">{error}</Text>}

        <Button type="submit" fullWidth mt="md">
          Crear Categoría
        </Button>
      </Stack>
    </form>
  );
}

export default AddCategoryForm;