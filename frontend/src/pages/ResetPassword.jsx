import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Title, PasswordInput, Button, Stack, Text } from '@mantine/core';
import axios from 'axios'; // Usamos axios normal, no la instancia autenticada

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Al cargar la página, extraemos el token de la URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('No se proporcionó un token de reseteo válido.');
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setError('Falta el token. Por favor, solicita un nuevo enlace.');
      return;
    }

    try {
      const payload = { token, password };
      // Usamos la URL base de la API directamente desde las variables de entorno
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      // La llamada se hace al endpoint /auth/reset-password
      await axios.post(`${baseURL}/auth/reset-password`, payload);
      
      setSuccess('¡Contraseña cambiada con éxito! Serás redirigido al login en 5 segundos.');
      
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) {
      setError(err.response?.data?.detail || 'El enlace es inválido o ha expirado.');
    }
  };

  return (
    <Container size="xs" my="xl">
      <Title order={1} align="center">Establecer Nueva Contraseña</Title>
      {success ? (
        <Text color="green" align="center" mt="md">{success}</Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack mt="lg">
            <PasswordInput
              label="Nueva Contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Confirmar Nueva Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
            {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="md" disabled={!token}>
              Guardar Contraseña
            </Button>
          </Stack>
        </form>
      )}
    </Container>
  );
}

export default ResetPassword;