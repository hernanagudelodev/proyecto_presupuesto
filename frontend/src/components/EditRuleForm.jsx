import { useState, useMemo, useEffect } from 'react';
import { TextInput, NumberInput, Select as MantineSelect, Button, Stack, Title, Text } from '@mantine/core';
import Select from 'react-select';
import axiosInstance from '../api/axiosInstance';

function EditRuleForm({ rule, categories, onRuleUpdated }) {
  // Inicializamos los estados con los datos de la regla existente
  const [descripcion, setDescripcion] = useState(rule.descripcion);
  const [valor_predeterminado, setValor] = useState(rule.valor_predeterminado);
  const [tipo, setTipo] = useState(rule.tipo);
  const [frecuencia, setFrecuencia] = useState(rule.frecuencia);
  const [dia, setDia] = useState(rule.dia || '');
  const [mes, setMes] = useState(rule.mes || '');
  const [error, setError] = useState(null);

  // Limpiamos día y mes si la frecuencia cambia a una que no los usa
  useEffect(() => {
    if (frecuencia === 'Mensual') setMes('');
    if (frecuencia === 'Semanal') setMes('');
  }, [frecuencia]);

  // Adaptamos las categorías para react-select
  const categoryOptions = useMemo(() =>
    categories
      .filter(cat => cat.tipo === tipo)
      .map(cat => ({ value: cat.id, label: cat.nombre })),
    [categories, tipo]
  );

  // Función para encontrar la opción inicial para la categoría
  const findCategoryOption = (id) => categoryOptions.find(option => option.value === id) || null;
  const [categoriaId, setCategoriaId] = useState(() => findCategoryOption(rule.categoria_predeterminada_id));

  // Efecto para re-evaluar la categoría seleccionada si el 'tipo' de transacción cambia
  // o si las opciones de categoría se actualizan.
  useEffect(() => {
    // Si la categoría seleccionada actualmente ya no es válida para el nuevo 'tipo', la limpiamos.
    if (categoriaId && !categoryOptions.some(opt => opt.value === categoriaId.value)) {
        setCategoriaId(null);
    }
  }, [tipo, categoryOptions, categoriaId]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const updatedRule = {
      descripcion,
      valor_predeterminado: parseFloat(valor_predeterminado),
      tipo,
      frecuencia,
      dia: dia ? parseInt(dia) : null,
      mes: mes ? parseInt(mes) : null,
      categoria_predeterminada_id: categoriaId ? categoriaId.value : null,
    };

    try {
      // Hacemos una llamada PUT para actualizar
      await axiosInstance.put(`/reglas-recurrentes/${rule.id}`, updatedRule);
      alert('¡Regla actualizada exitosamente!');
      onRuleUpdated();
    } catch (err) {
      setError('No se pudo actualizar la regla.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Editar Regla Recurrente</Title>
        <TextInput label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.currentTarget.value)} required />
        <NumberInput label="Valor Predeterminado" value={valor_predeterminado} onChange={setValor} required />
        <MantineSelect label="Tipo" data={['Gasto', 'Ingreso']} value={tipo} onChange={setTipo} required />
        <MantineSelect label="Frecuencia" data={['Mensual', 'Semanal', 'Anual']} value={frecuencia} onChange={setFrecuencia} required />
        
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
            value={String(dia)}
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
        <Button type="submit" fullWidth mt="md">Guardar Cambios</Button>
      </Stack>
    </form>
  );
}

export default EditRuleForm;