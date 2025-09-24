import { useState } from 'react';
import { TextInput, Button, Stack, Title, Switch, Group, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function EditUserForm({ user, onUserUpdated, onCancel }) {
  // Estados para cada campo del formulario, inicializados con los datos del usuario
  const [nombre, setNombre] = useState(user.nombre);
  const [isActive, setIsActive] = useState(user.is_active);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [isSuperuser, setIsSuperuser] = useState(user.is_superuser);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      // Construimos el objeto que enviaremos a la API.
      // Incluimos todos los campos que nuestro schema `AdminUserUpdate` espera.
      const updatedUserData = {
        nombre,
        is_active: isActive,
        is_verified: isVerified,
        is_superuser: isSuperuser,
      };

      // Hacemos la llamada PATCH a la API con el ID del usuario
      await axiosInstance.patch(`/admin/users/${user.id}`, updatedUserData);
      
      alert('¡Usuario actualizado exitosamente!');
      onUserUpdated(); // Esta función refrescará la lista de usuarios en la página principal
    } catch (err) {
      setError('No se pudo actualizar el usuario. Inténtalo de nuevo.');
      console.error(err.response?.data || err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Editar Usuario</Title>
        <Text size="sm" c="dimmed" mt={-10} mb={10}>{user.email}</Text>
        
        <TextInput 
          label="Nombre Completo" 
          value={nombre} 
          onChange={(e) => setNombre(e.currentTarget.value)} 
          required 
        />
        
        <Stack spacing="xs" mt="md">
            <Switch 
              label="Usuario está Activo" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.currentTarget.checked)} 
            />
            <Switch 
              label="Usuario está Verificado" 
              checked={isVerified} 
              onChange={(e) => setIsVerified(e.currentTarget.checked)} 
            />
            <Switch 
              label="Es Superusuario (Admin)" 
              checked={isSuperuser} 
              onChange={(e) => setIsSuperuser(e.currentTarget.checked)} 
            />
        </Stack>
        
        {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        
        <Group position="right" mt="xl">
            <Button variant="default" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default EditUserForm;