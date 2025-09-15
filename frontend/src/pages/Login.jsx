import { useState } from 'react';
// Importamos la instancia de axios que ya tiene la configuración base
import axiosInstance from '../api/axiosInstance';
// Importa el hook 'useNavigate' para poder redirigir al usuario
import { useNavigate } from 'react-router-dom';
// Importa el hook 'useAuth' para manejar la autenticación
import { useAuth } from '../context/AuthContext'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;