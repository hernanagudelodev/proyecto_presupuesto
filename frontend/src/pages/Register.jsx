import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {Container,Title,Paper,TextInput,PasswordInput,Button,Stack,Text,} from '@mantine/core';
import axios from 'axios';

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const payload = { nombre, email, password };
      const baseURL = import.meta.env.VITE_API_BASE_URL;

      // Hacemos la llamada al endpoint de registro de fastapi-users
      await axios.post(`${baseURL}/auth/register`, payload);

      // Si el registro es exitoso, mostramos un mensaje
      setSuccess(true);

    } catch (err) {
      // Manejo de errores específicos del backend (ej: email ya existe)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocurrió un error durante el registro. Inténtalo de nuevo.');
      }
    }
  };

  // Si el registro fue exitoso, mostramos un mensaje en lugar del formulario
  if (success) {
    return (
      <Container size="xs" my="xl">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} align="center" mb="lg">¡Registro Exitoso!</Title>
          <Text align="center">
            Te hemos enviado un correo para verificar tu cuenta. Por favor, revisa tu bandeja de entrada.
          </Text>
          <Button fullWidth mt="xl" component={NavLink} to="/login">
            Volver al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" my="xl">
      <Title align="center">Crear una Cuenta</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        ¿Ya tienes una cuenta?{' '}
        <NavLink to="/login" style={{ textDecoration: 'none' }}>
          Inicia sesión
        </NavLink>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Nombre Completo"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              type="email"
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
            {error && <Text color="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="xl">
              Registrarse
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default Register;