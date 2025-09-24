import { useState } from 'react';
import { TextInput, NumberInput, Button, Stack, Title, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function EditAccountForm({ account, onAccountUpdated }) {
  const [nombre, setNombre] = useState(account.nombre);
  const [tipo, setTipo] = useState(account.tipo);
  const saldoInicial = account.saldo_inicial;
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const updatedAccount = {
        nombre,
        tipo
      };
      await axiosInstance.put(`/cuentas/${account.id}`, updatedAccount);
      alert('¡Cuenta actualizada!');
      onAccountUpdated();
    } catch (err) {
      setError('No se pudo actualizar la cuenta.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Editar Cuenta</Title>
        <TextInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} required />
        <TextInput label="Tipo" value={tipo} onChange={(e) => setTipo(e.currentTarget.value)} required />
        <NumberInput label="Saldo Inicial" value={saldoInicial} readOnly required precision={2} />
        {error && <Text color="red" size="sm">{error}</Text>}
        <Button type="submit" fullWidth mt="md">Guardar Cambios</Button>
      </Stack>
    </form>
  );
}
export default EditAccountForm;