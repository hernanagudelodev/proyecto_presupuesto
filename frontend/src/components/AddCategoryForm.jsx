import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function AddCategoryForm({ onCategoryAdded }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Gasto'); // Valor por defecto
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const newCategory = { nombre, tipo };
      await axiosInstance.post('/categorias/', newCategory);

      alert('¡Categoría creada exitosamente!');
      setNombre('');
      setTipo('Gasto');
      onCategoryAdded();

    } catch (err) {
      setError('No se pudo crear la categoría.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Añadir Nueva Categoría</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>Nombre: </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>Tipo: </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Gasto">Gasto</option>
          <option value="Ingreso">Ingreso</option>
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Crear Categoría</button>
    </form>
  );
}

export default AddCategoryForm;