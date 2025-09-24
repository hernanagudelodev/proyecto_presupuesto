// Importamos los estilos de nuestro nuevo archivo CSS
import styles from './AccountsSummary.module.css';
// Mantenemos los componentes de Mantine que sí funcionan bien
import { Paper, Text, Group, Divider, List, Stack } from '@mantine/core';

function AccountsSummary({ accounts, totalBalance }) {
  return (
    // Aplicamos la clase principal 'card' desde nuestro CSS
    <Paper withBorder shadow="sm" p="md" className={styles.card}>
      
      <div className={styles.header}>
        <Stack spacing="xs">
          <Text size="lg" weight={700}>Mis Cuentas</Text>
          <Group position="apart" className={styles.balanceGroup}>
            <Text className={styles.totalLabel}>Saldo Total Actual:</Text>
            <Text className={styles.totalAmount} color={totalBalance >= 0 ? 'teal' : 'red'}>
              ${totalBalance.toLocaleString()}
            </Text>
          </Group>
        </Stack>
      </div>

      <Divider />
      
      {accounts.length > 0 ? (
        // Aplicamos la clase que fuerza a este div a estirarse
        <div className={styles.listWrapper}>
          <List spacing="xs" size="sm">
            {accounts.map(acc => (
              <List.Item key={acc.id}>
                <Group position="apart">
                  <Text>{acc.nombre} ({acc.tipo})</Text>
                  <Text weight={500}>${acc.saldo_actual.toLocaleString()}</Text>
                </Group>
              </List.Item>
            ))}
          </List>
        </div>
      ) : (
        <Text color="dimmed" pt="md">Aún no tienes cuentas.</Text>
      )}
    </Paper>
  );
}

export default AccountsSummary;