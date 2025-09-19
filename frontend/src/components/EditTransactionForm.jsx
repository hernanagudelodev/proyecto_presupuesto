import { useState, useEffect, useMemo } from 'react';
import { TextInput, NumberInput, Select as MantineSelect, Button, Stack, Title, Text } from '@mantine/core';
import Select from 'react-select';
import axiosInstance from '../api/axiosInstance';

function EditTransactionForm({ transaction, accounts, categories, onTransactionUpdated }) {
  // --- Estados del formulario ---
  const [tipo, setTipo] = useState(transaction.tipo);
  const [fecha, setFecha] = useState(transaction.fecha);
  const [valor, setValor] = useState(transaction.valor);
  const [descripcion, setDescripcion] = useState(transaction.descripcion);
  const [estado, setEstado] = useState(transaction.estado); // Estado para el campo 'estado'
  const [error, setError] = useState(null);

  // --- Lógica para los selectores ---
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

  useEffect(() => {
    setCategoriaId(findOption(categoryOptions, transaction.categoria_id));
  }, [tipo, categoryOptions, transaction.categoria_id]);

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const transactionData = {
      fecha,
      valor: parseFloat(valor),
      tipo,
      descripcion,
      estado, // Se incluye el estado en los datos a enviar
      cuenta_origen_id: cuentaOrigenId ? cuentaOrigenId.value : null,
      cuenta_destino_id: cuentaDestinoId ? cuentaDestinoId.value : null,
      categoria_id: categoriaId ? categoriaId.value : null,
    };

    try {
      await axiosInstance.put(`/transacciones/${transaction.id}`, transactionData);
      alert('¡Transacción actualizada exitosamente!');
      onTransactionUpdated();
    } catch (err) {
      // --- CORRECCIÓN DEFINITIVA DEL MANEJO DE ERRORES ---
      let errorMessage = 'No se pudo actualizar la transacción.'; // Mensaje por defecto

      const errorDetail = err.response?.data?.detail;
      
      if (typeof errorDetail === 'string') {
        // Caso 1: El error es un mensaje de texto simple (ej. un error 404).
        errorMessage = errorDetail;
      } else if (Array.isArray(errorDetail) && errorDetail.length > 0) {
        // Caso 2: El error es una lista de errores de validación de Pydantic.
        // Tomamos el mensaje del primer error de la lista.
        errorMessage = errorDetail[0].msg || errorMessage;
      }

      setError(errorMessage);
      console.error("Error completo:", err.response?.data || err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <Stack>
            <Title order={3}>Editar Transacción</Title>
            
            <MantineSelect label="Tipo de Movimiento" data={['Gasto', 'Ingreso', 'Transferencia']} value={tipo} onChange={setTipo} required/>
            <MantineSelect label="Estado" data={['Confirmado', 'Planeado']} value={estado} onChange={setEstado} required/>

            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}/>
            <TextInput label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.currentTarget.value)} required/>
            <NumberInput label="Valor" value={valor} onChange={setValor} precision={2} required/>

            {(tipo === 'Gasto' || tipo === 'Transferencia') && (
              <div>
                <label>Cuenta de Origen</label>
                <Select options={accountOptions} onChange={setCuentaOrigenId} value={cuentaOrigenId} isSearchable/>
              </div>)}
            {(tipo === 'Ingreso' || tipo === 'Transferencia') && (
              <div>
                <label>Cuenta de Destino</label>
                <Select options={accountOptions} onChange={setCuentaDestinoId} value={cuentaDestinoId} isSearchable/>
              </div>)}
            {(tipo === 'Gasto' || tipo === 'Ingreso') && (
              <div>
                <label>Categoría</label>
                <Select options={categoryOptions} onChange={setCategoriaId} value={categoriaId} isSearchable/>
              </div>)}
            {(tipo === 'Gasto' || tipo === 'Ingreso') && (
              <div>
                <label>Categoría</label>
                <Select options={categoryOptions} onChange={setCategoriaId} value={categoriaId} isSearchable/>
              </div>)}

            {error && <Text color="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="md">Guardar Cambios</Button>
        </Stack>
    </form>
  );
}

export default EditTransactionForm;