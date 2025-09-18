import { useState, useMemo, useEffect } from 'react';
import { TextInput, NumberInput, Select as MantineSelect, Button, Stack, Title, Text } from '@mantine/core';
import Select from 'react-select'; // Para el selector con búsqueda de categorías
import axiosInstance from '../api/axiosInstance';

// El formulario necesita la lista de categorías para el menú desplegable
function AddRuleForm({ categories, onRuleAdded }) {
  const [descripcion, setDescripcion]       = useState('');
  const [valor_predeterminado, setValor]    = useState('');
  const [tipo, setTipo]                     = useState('Gasto');
  const [frecuencia, setFrecuencia]         = useState('Mensual');
  const [dia, setDia]                       = useState('');
  const [mes, setMes]                       = useState('');
  const [categoriaId, setCategoriaId]       = useState(null);
  const [error, setError]                   = useState(null);


  // Limpiamos los campos de día y mes cuando cambia la frecuencia
  useEffect(() => {
    setDia('');
    setMes('');
  }, [frecuencia]);

  // Adaptamos las categorías para el formato que necesita react-select
  const categoryOptions = useMemo(() => 
    categories
      .filter(cat => cat.tipo === tipo) // Filtramos por tipo Ingreso/Gasto
      .map(cat => ({ value: cat.id, label: cat.nombre })),
    [categories, tipo]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const newRule = {
      descripcion,
      valor_predeterminado: parseFloat(valor_predeterminado),
      tipo,
      frecuencia,
      dia: parseInt(dia),
      mes: mes ? parseInt(mes) : null,
      categoria_predeterminada_id: categoriaId ? categoriaId.value : null,
    };

    try {
      await axiosInstance.post('/reglas-recurrentes/', newRule);
      alert('¡Regla creada exitosamente!');
      onRuleAdded(); // Cierra el modal y recarga la lista
    } catch (err) {
      setError('No se pudo crear la regla.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Crear Nueva Regla Recurrente</Title>
        <TextInput label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.currentTarget.value)} required />
        <NumberInput label="Valor Predeterminado" value={valor_predeterminado} onChange={setValor} required />
        <MantineSelect label="Tipo" data={['Gasto', 'Ingreso']} value={tipo} onChange={setTipo} required />
        <MantineSelect label="Frecuencia" data={['Mensual', 'Semanal', 'Anual']} value={frecuencia} onChange={setFrecuencia} required />

        {/* --- LÓGICA CONDICIONAL PARA DÍA Y MES --- */}

        {frecuencia === 'Mensual' && (
          <NumberInput label="Día del Mes (1-31)" value={dia} onChange={setDia} min={1} max={31} required />
        )}

        {frecuencia === 'Semanal' && (
          <MantineSelect 
            label="Día de la Semana"
            placeholder="Selecciona un día"
            data={[
              { value: '0', label: 'Lunes' }, { value: '1', label: 'Martes' },
              { value: '2', label: 'Miércoles' }, { value: '3', label: 'Jueves' },
              { value: '4', label: 'Viernes' }, { value: '5', label: 'Sábado' },
              { value: '6', label: 'Domingo' },
            ]}
            value={dia}
            onChange={setDia}
            required 
          />
        )}

        {frecuencia === 'Anual' && (
          <>
            <NumberInput label="Día del Mes (1-31)" value={dia} onChange={setDia} min={1} max={31} required />
            <NumberInput label="Mes del Año (1-12)" value={mes} onChange={setMes} min={1} max={12} required />
          </>
        )}

        <div>
          <label style={{fontSize: '14px', fontWeight: 500}}>Categoría Predeterminada</label>
          <Select options={categoryOptions} onChange={setCategoriaId} value={categoriaId} isSearchable />
        </div>

        {error && <Text color="red" size="sm">{error}</Text>}
        <Button type="submit" fullWidth mt="md">Guardar Regla</Button>
      </Stack>
    </form>
  );
}

export default AddRuleForm;