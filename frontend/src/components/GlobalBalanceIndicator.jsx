// frontend/src/components/GlobalBalanceIndicator.jsx
import { useState, useCallback, useMemo } from 'react';
import { Affix, Button, Modal, Paper, Title, Text, Group, List, Divider, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconWallet } from '@tabler/icons-react'; // Un ícono relevante
import axiosInstance from '../api/axiosInstance';

function GlobalBalanceIndicator() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Calculamos el saldo total a partir de las cuentas cargadas
  const totalBalance = useMemo(() => 
    accounts.reduce((sum, acc) => sum + acc.saldo_actual, 0), 
    [accounts]
  );

  // Función para cargar los datos de las cuentas cuando se abre el modal
  const handleOpenModal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/cuentas/');
      setAccounts(response.data);
      open(); // Abre el modal solo cuando los datos están listos
    } catch (err) {
      setError('No se pudieron cargar los saldos de las cuentas.');
    } finally {
      setLoading(false);
    }
  }, [open]);

  return (
    <>
      {/* El Affix posiciona nuestro botón flotante */}
      <Affix position={{ bottom: 20, left: 20 }}>
        <Button
          leftSection={<IconWallet size={16} />}
          onClick={handleOpenModal}
          loading={loading}
          color="green" // Le damos un color distintivo
        >
          Ver Saldos
        </Button>
      </Affix>

      {/* Modal que se abre al hacer clic */}
      <Modal opened={opened} onClose={close} title="Saldos de Cuentas" centered>
        <LoadingOverlay visible={loading} />
        {error ? (
          <Text color="red">{error}</Text>
        ) : (
          <Paper p="md">
            {/* Cabecera con el Saldo Total */}
            <Group position="apart" align="baseline">
              <Title order={4}>Saldo Total:</Title>
              <Text fz="1.5rem" weight={700} color={totalBalance >= 0 ? 'teal' : 'red'}>
                ${totalBalance.toLocaleString()}
              </Text>
            </Group>
            <Divider my="md" />

            {/* Lista con el saldo de cada cuenta */}
            <List spacing="sm" size="sm">
              {accounts.map(acc => (
                <List.Item key={acc.id}>
                  <Group position="apart">
                    <Text>{acc.nombre} ({acc.tipo})</Text>
                    <Text weight={500}>${acc.saldo_actual.toLocaleString()}</Text>
                  </Group>
                </List.Item>
              ))}
            </List>
          </Paper>
        )}
      </Modal>
    </>
  );
}

export default GlobalBalanceIndicator;