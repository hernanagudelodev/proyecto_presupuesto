// frontend/src/components/GlobalAddTransactionButton.jsx
import { useState, useCallback } from 'react';
import { Affix, Button, Transition, Modal, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import axiosInstance from '../api/axiosInstance';
import AddTransactionForm from './AddTransactionForm';

function GlobalAddTransactionButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para guardar los datos que necesita el formulario
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Esta función se ejecutará cuando se haga clic en el botón flotante
  const handleOpenModal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargamos los datos más recientes de cuentas y categorías
      const [accRes, catRes] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/'),
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      open(); // Abrimos el modal solo después de cargar los datos
    } catch (err) {
      setError('No se pudieron cargar los datos para el formulario.');
      // Opcional: mostrar una notificación de error al usuario
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [open]);

  // Esta función se pasará al formulario. Se ejecutará cuando una transacción se cree exitosamente.
  const handleTransactionAdded = () => {
    close(); // Cierra el modal
    window.location.reload(); // Recarga la página para mostrar los datos actualizados
  };

  return (
    <>
      {/* El componente Affix posiciona el botón de forma flotante */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconPlus size={16} />}
              style={transitionStyles}
              onClick={handleOpenModal}
              loading={loading} // Muestra un spinner si está cargando datos
            >
              Añadir Transacción
            </Button>
          )}
        </Transition>
      </Affix>

      {/* Usamos un Modal de Mantine en lugar de nuestro GenericModal para mejor integración */}
      <Modal opened={opened} onClose={close} title="Añadir Nueva Transacción" centered>
        <LoadingOverlay visible={loading} />
        {error ? (
          <Text color="red">{error}</Text>
        ) : (
          <AddTransactionForm
            accounts={accounts}
            categories={categories}
            onTransactionAdded={handleTransactionAdded}
          />
        )}
      </Modal>
    </>
  );
}

export default GlobalAddTransactionButton;