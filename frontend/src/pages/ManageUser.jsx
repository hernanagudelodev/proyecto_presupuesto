import { useState, useEffect, useCallback } from 'react';
import { Container, Title, TextInput, Button, Stack, Text, PasswordInput, Paper, Divider } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function ManageUser() {
  // --- Estados para el perfil ---
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Estados para el flujo de cambio de contraseña
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');


  // Carga los datos del usuario (nombre y email)
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      setNombre(response.data.nombre);
      setEmail(response.data.email);
    } catch (err) {
      setProfileError('No se pudieron cargar los datos del usuario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Manejador para actualizar el nombre
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError(null);
    try {
      await axiosInstance.patch('/users/me', { nombre });
      alert('¡Nombre actualizado exitosamente!');
    } catch (err) {
      setProfileError('No se pudo actualizar el nombre.');
    }
  };

  // --- LÓGICA PARA INICIAR EL CAMBIO DE CONTRASEÑA ---
  const handleRequestPasswordChange = async () => {
    setPasswordMessage('');
    setPasswordError('');
    try {
      // Llamamos al endpoint que ya existe para "contraseña olvidada"
      await axiosInstance.post('/auth/forgot-password', { email });
      setPasswordMessage('¡Revisa tu correo! Te hemos enviado un enlace para cambiar tu contraseña.');
    } catch (err) {
      setPasswordError('No se pudo enviar el correo. Inténtalo de nuevo más tarde.');
    }
  };

  if (loading) return <p>Cargando información del usuario...</p>;

  return (
    <Container size="sm" my="md">
      <Title order={1} mb="xl">Mi Perfil</Title>
      
      {/* --- SECCIÓN PARA ACTUALIZAR DATOS BÁSICOS --- */}
      <Paper withBorder shadow="sm" p="lg">
        <form onSubmit={handleProfileSubmit}>
          <Stack>
            <Title order={3}>Información Personal</Title>
            <TextInput label="Correo Electrónico" value={email} disabled />
            <TextInput
              label="Nombre Completo"
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
              required
            />
            {profileError && <Text color="red" size="sm">{profileError}</Text>}
            <Button type="submit" mt="sm" style={{ alignSelf: 'flex-start' }}>
              Guardar Nombre
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* --- SECCIÓN SIMPLIFICADA PARA CAMBIAR CONTRASEÑA --- */}
      <Paper withBorder shadow="sm" p="lg" mt="xl">
        <Stack>
          <Title order={3}>Seguridad</Title>
          <Text size="sm">
            Para cambiar tu contraseña, te enviaremos un enlace seguro a tu correo electrónico.
          </Text>
          <Button onClick={handleRequestPasswordChange} style={{ alignSelf: 'flex-start' }}>
            Enviar enlace para cambiar contraseña
          </Button>
          {passwordMessage && <Text color="green" size="sm">{passwordMessage}</Text>}
          {passwordError && <Text color="red" size="sm">{passwordError}</Text>}
        </Stack>
      </Paper>
    </Container>
  );
}

export default ManageUser;