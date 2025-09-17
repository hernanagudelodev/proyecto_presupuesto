import { useState } from 'react';
import { TextInput, NumberInput, Button, Stack } from '@mantine/core'; // <-- Importa componentes de formulario de Mantine
import axiosInstance from '../api/axiosInstance';

// Este componente recibe una función 'onAccountAdded' para notificar al Dashboard
function AddAccountForm({ onAccountAdded }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Limpiamos errores anteriores

    try {
      // Creamos el objeto con los datos de la nueva cuenta
      const newAccount = {
        nombre,
        tipo,
        saldo_inicial: parseFloat(saldoInicial), // El backend espera un número
      };

      // Hacemos la llamada POST a la API para crear la cuenta
      await axiosInstance.post('/cuentas/', newAccount);

      alert('¡Cuenta creada exitosamente!');

      // Limpiamos el formulario
      setNombre('');
      setTipo('');
      setSaldoInicial('');

      // Llamamos a la función que nos pasó el Dashboard para que se actualice
      onAccountAdded();

    } catch (err) {
      setError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  // --- RENDERIZADO CON COMPONENTES DE MANTINE ---
  return (
    // 2. Usamos un <form> normal, pero dentro ponemos los componentes de Mantine
    <form onSubmit={handleSubmit}>
      {/* <Stack> nos ayuda a espaciar los elementos verticalmente */}
      <Stack>
        <Title order={3}>Añadir Nueva Cuenta</Title>

        <TextInput
          label="Nombre de la Cuenta"
          placeholder="Ej: Bancolombia"
          value={nombre}
          onChange={(event) => setNombre(event.currentTarget.value)}
          required
        />

        <TextInput
          label="Tipo"
          placeholder="Ej: Banco, Efectivo, Tarjeta"
          value={tipo}
          onChange={(event) => setTipo(event.currentTarget.value)}
          required
        />

        <NumberInput
          label="Saldo Inicial"
          placeholder="100000"
          value={saldoInicial}
          onChange={setSaldoInicial} // NumberInput devuelve el número directamente
          required
          precision={2} // Permite 2 decimales
          step={1000}   // Aumenta/disminuye en pasos de 1000 con las flechas
        />

        {error && <Text color="red" size="sm">{error}</Text>}

        {/* El botón de Mantine tiene más opciones, como 'fullWidth' */}
        <Button type="submit" fullWidth mt="md">
          Crear Cuenta
        </Button>
      </Stack>
    </form>
  );
}

// Importamos también Title, Text para que no falte nada
import { Title, Text } from '@mantine/core';
export default AddAccountForm;