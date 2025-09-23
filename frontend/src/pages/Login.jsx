import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom'; // <-- 1. AÑADIR NavLink
import {Container,Title,Paper,TextInput,PasswordInput, Button, Text, Stack,} from '@mantine/core';
import axiosInstance from '../api/axiosInstance';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  // Llama al hook para obtener la función de navegación
  const navigate = useNavigate();
  // Llama al hook para obtener la función de login
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Se realiza la solicitud POST al endpoint de login
      const response = await axiosInstance.post(
        '/auth/jwt/login',
        formData
      );

      // Llama a la función login del contexto para guardar el token globalmente
      login(response.data.access_token);

      navigate('/dashboard');

    } catch (error) {
      if (error.response) {
        console.error('Error del servidor:', error.response.data);
        const errorMessage = error.response.data.detail || 'Revisa tus credenciales.';
        alert(`Error: ${errorMessage}`);
      } else {
        console.error('Error de red o de solicitud:', error.message);
        alert('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <Container size="xs" my="xl">
      <Title align="center">¡Bienvenido de Nuevo!</Title>
      
      {/* --- 3. AÑADIR ESTE BLOQUE DE TEXTO Y ENLACE --- */}
      <Text color="dimmed" size="sm" align="center" mt={5}>
        ¿No tienes una cuenta?{' '}
        <NavLink to="/register" style={{ textDecoration: 'none' }}>
          Regístrate aquí
        </NavLink>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            {error && <Text color="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="xl">
              Iniciar Sesión
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;