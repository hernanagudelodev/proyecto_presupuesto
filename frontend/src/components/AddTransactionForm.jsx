import { useState, useEffect, useMemo } from 'react';
import { TextInput, NumberInput, Select as MantineSelect, Button, Stack, Title, Text } from '@mantine/core';
import axiosInstance from '../api/axiosInstance';
import Select from 'react-select'; // El componente para selectores con búsqueda

function AddTransactionForm({ accounts, categories, onTransactionAdded }) {
  // --- ESTADOS DEL FORMULARIO ---
  // Estado para el tipo de transacción, que controla qué campos se muestran
  const [tipo, setTipo] = useState('Gasto');

  // Estados para los campos de datos de la transacción
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Estados para las selecciones en los menús. Guardamos el objeto completo que nos da react-select
  const [cuentaOrigenId, setCuentaOrigenId] = useState(null);
  const [cuentaDestinoId, setCuentaDestinoId] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);

  const [error, setError] = useState(null);

  // --- EFECTOS Y DATOS MEMORIZADOS ---

  // Este efecto se ejecuta cada vez que el 'tipo' de transacción cambia.
  // Su función es limpiar las selecciones anteriores para evitar enviar datos incorrectos.
  useEffect(() => {
    setCuentaOrigenId(null);
    setCuentaDestinoId(null);
    setCategoriaId(null);
  }, [tipo]);

  // 'react-select' necesita que las opciones tengan el formato { value: 'id', label: 'Nombre' }.
  // Transformamos nuestras listas de cuentas y categorías a este formato.
  // 'useMemo' es una optimización: evita que estos arrays se recalculen si los datos no han cambiado.
  const accountOptions = useMemo(() => 
    accounts.map(acc => ({ value: acc.id, label: acc.nombre })),
    [accounts]
  );

  const categoryOptions = useMemo(() => 
    categories
      .filter(cat => cat.tipo === tipo) // ¡Importante! Filtramos las categorías según el tipo de transacción
      .map(cat => ({ value: cat.id, label: cat.nombre })),
    [categories, tipo]
  );

  // --- MANEJO DEL ENVÍO ---

  const handleSubmit = async (event) => {
    event.preventDefault(); // Previene que la página se recargue
    setError(null);

    // Construimos el objeto que enviaremos a la API, extrayendo el '.value' de las selecciones
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
      // Hacemos la llamada a la API con los datos de la nueva transacción
      await axiosInstance.post('/transacciones/', transactionData);
      alert('¡Transacción creada exitosamente!');
      onTransactionAdded(); // Avisamos al Dashboard que todo salió bien
    } catch (err) {
        const errorMessage = err.response?.data?.detail || 'No se pudo crear la transacción.';
        setError(errorMessage);
        console.error(err);
    }
  };

  // --- RENDERIZADO DEL COMPONENTE (JSX) ---
  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Title order={3}>Añadir Nueva Transacción</Title>

        {/* Selector principal para el Tipo de Movimiento */}
        <MantineSelect
            label="Tipo de Movimiento"
            data={[
                { value: 'Gasto', label: 'Gasto' },
                { value: 'Ingreso', label: 'Ingreso' },
                { value: 'Transferencia', label: 'Transferencia' },
            ]}
            value={tipo}
            onChange={setTipo}
            required
        />

        {/* Campos de texto comunes a todos los tipos */}
        {/* Usamos un input normal para la fecha, pero le damos estilos para que encaje */}
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}/>

        <TextInput
            label="Descripción"
            placeholder="Café, Salario, etc."
            value={descripcion}
            onChange={(event) => setDescripcion(event.currentTarget.value)}
            required
        />

        <NumberInput
            label="Valor"
            placeholder="50000"
            value={valor}
            onChange={setValor}
            precision={2}
            required
        />

        {/* --- RENDERIZADO CONDICIONAL de los Selectores con Búsqueda --- */}

        {/* Si es Gasto o Transferencia, muestra el selector de "Cuenta de Origen" */}
        {(tipo === 'Gasto' || tipo === 'Transferencia') && (
            <div>
                <label style={{fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px'}}>Cuenta de Origen</label>
                <Select
                    options={accountOptions}
                    onChange={setCuentaOrigenId}
                    value={cuentaOrigenId}
                    placeholder="-- Selecciona y busca una cuenta --"
                    isSearchable
                />
            </div>
        )}

        {/* Si es Ingreso o Transferencia, muestra el selector de "Cuenta de Destino" */}
        {(tipo === 'Ingreso' || tipo === 'Transferencia') && (
            <div style={{marginTop: '1rem'}}>
                <label style={{fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px'}}>Cuenta de Destino</label>
                <Select
                    options={accountOptions}
                    onChange={setCuentaDestinoId}
                    value={cuentaDestinoId}
                    placeholder="-- Selecciona y busca una cuenta --"
                    isSearchable
                />
            </div>
        )}

        {/* Si NO es Transferencia (o sea, es Gasto o Ingreso), muestra el selector de Categoría */}
        {(tipo === 'Gasto' || tipo === 'Ingreso') && (
            <div style={{marginTop: '1rem'}}>
                <label style={{fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px'}}>Categoría</label>
                <Select
                    options={categoryOptions}
                    onChange={setCategoriaId}
                    value={categoriaId}
                    placeholder="-- Selecciona y busca una categoría --"
                    isSearchable
                />
            </div>
        )}
          
        {/* Muestra un mensaje de error si algo falla */}
        {error && <Text color="red" size="sm">{error}</Text>}

        <Button type="submit" fullWidth mt="md">
            Crear Transacción
        </Button>
      </Stack>
    </form>
  );
}
export default AddTransactionForm;