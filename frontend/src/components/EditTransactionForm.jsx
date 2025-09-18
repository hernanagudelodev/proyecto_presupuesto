import { useState, useEffect, useMemo } from 'react';
import { TextInput, NumberInput, Select as MantineSelect, Button, Stack, Title, Text } from '@mantine/core';
import Select from 'react-select';
import axiosInstance from '../api/axiosInstance';

// Este formulario recibe la transacción a editar
function EditTransactionForm({ transaction, accounts, categories, onTransactionUpdated }) {
  // Inicializamos los estados con los datos de la transacción existente
  const [tipo, setTipo] = useState(transaction.tipo);
  const [fecha, setFecha] = useState(transaction.fecha);
  const [valor, setValor] = useState(transaction.valor);
  const [descripcion, setDescripcion] = useState(transaction.descripcion);

  // Lógica para encontrar las opciones seleccionadas por defecto para react-select
  const findOption = (options, id) => options.find(option => option.value === id) || null;

  const accountOptions = useMemo(() =>
    accounts.map(acc => ({ value: acc.id, label: acc.nombre })),
    [accounts]
  );

  const categoryOptions = useMemo(() =>
    categories
      .filter(cat => cat.tipo === tipo)
      .map(cat => ({ value: cat.id, label: cat.nombre })),
    [categories, tipo]
  );

  const [cuentaOrigenId, setCuentaOrigenId] = useState(() => findOption(accountOptions, transaction.cuenta_origen_id));
  const [cuentaDestinoId, setCuentaDestinoId] = useState(() => findOption(accountOptions, transaction.cuenta_destino_id));
  const [categoriaId, setCategoriaId] = useState(() => findOption(categoryOptions, transaction.categoria_id));

  const [error, setError] = useState(null);

  // Efecto para actualizar las categorías si el tipo de transacción cambia
  useEffect(() => {
    setCategoriaId(findOption(categoryOptions, transaction.categoria_id));
  }, [tipo, categoryOptions, transaction.categoria_id]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const transactionData = {
      fecha,
      valor: parseFloat(valor),
      tipo,
      descripcion,
      cuenta_origen_id: cuentaOrigenId ? cuentaOrigenId.value : null,
      cuenta_destino_id: cuentaDestinoId ? cuentaDestinoId.value : null,
      categoria_id: categoriaId ? categoriaId.value : null,
    };

    try {
      // Hacemos una llamada PUT al endpoint para actualizar la transacción
      await axiosInstance.put(`/transacciones/${transaction.id}`, transactionData);
      alert('¡Transacción actualizada exitosamente!');
      onTransactionUpdated(); // Cierra el modal y recarga
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'No se pudo actualizar la transacción.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <Stack>
            <Title order={3}>Editar Transacción</Title>
            {/* ... (El resto del JSX del formulario es idéntico al de AddTransactionForm) ... */}
            <MantineSelect label="Tipo de Movimiento" data={['Gasto', 'Ingreso', 'Transferencia']} value={tipo} onChange={setTipo} required/>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}/>
            <TextInput label="Descripción" value={descripcion} onChange={(event) => setDescripcion(event.currentTarget.value)} required/>
            <NumberInput label="Valor" value={valor} onChange={setValor} precision={2} required/>
            {(tipo === 'Gasto' || tipo === 'Transferencia') && (<div><label>Cuenta de Origen</label><Select options={accountOptions} onChange={setCuentaOrigenId} value={cuentaOrigenId} isSearchable/></div>)}
            {(tipo === 'Ingreso' || tipo === 'Transferencia') && (<div><label>Cuenta de Destino</label><Select options={accountOptions} onChange={setCuentaDestinoId} value={cuentaDestinoId} isSearchable/></div>)}
            {(tipo === 'Gasto' || tipo === 'Ingreso') && (<div><label>Categoría</label><Select options={categoryOptions} onChange={setCategoriaId} value={categoriaId} isSearchable/></div>)}
            {error && <Text color="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="md">Guardar Cambios</Button>
        </Stack>
    </form>
  );
}

export default EditTransactionForm;