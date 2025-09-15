import { useState } from 'react';
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

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Añadir Nueva Cuenta</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>Nombre de la Cuenta: </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>Tipo (Ej: Banco, Efectivo): </label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>Saldo Inicial: </label>
        <input
          type="number"
          value={saldoInicial}
          onChange={(e) => setSaldoInicial(e.target.value)}
          required
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit">Crear Cuenta</button>
    </form>
  );
}

export default AddAccountForm;