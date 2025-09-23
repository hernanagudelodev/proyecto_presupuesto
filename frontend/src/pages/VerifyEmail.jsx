import { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { Container, Title, Text, Button, Paper, Loader, Center } from '@mantine/core';
import axios from 'axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('El enlace no contiene un token de verificación.');
      return;
    }

    const verifyToken = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        // Hacemos la petición POST al backend con el token
        await axios.post(`${baseURL}/auth/verify`, { token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        const detail = err.response?.data?.detail || 'El token es inválido o ha expirado.';
        setErrorMessage(detail);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Container size="xs" my="xl">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} align="center" mb="lg">Verificando tu Cuenta</Title>
        
        {status === 'verifying' && (
          <Center>
            <Loader />
            <Text ml="md">Un momento por favor...</Text>
          </Center>
        )}

        {status === 'success' && (
          <Stack align="center">
            <Text color="green">¡Tu cuenta ha sido verificada con éxito!</Text>
            <Button component={NavLink} to="/login" mt="md">
              Ir a Iniciar Sesión
            </Button>
          </Stack>
        )}

        {status === 'error' && (
          <Stack align="center">
            <Text color="red">Error en la verificación</Text>
            <Text size="sm" color="dimmed" align="center">{errorMessage}</Text>
            <Button component={NavLink} to="/login" mt="md">
              Volver
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
// Necesitamos importar Stack de Mantine también
import { Stack } from '@mantine/core';
export default VerifyEmail;