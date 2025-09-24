import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Text, Select } from '@mantine/core';

const monthNames = {
  1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
};

function MonthlySummaryChart({ data, selectedYear, onYearChange }) {
  const chartData = data.map(item => ({
    ...item,
    monthName: monthNames[item.mes],
  }));

  // Generamos una lista de años para el selector (ej: últimos 5 años)
  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <Paper withBorder shadow="sm" p="md" style={{ height: '400px' }}>
      <Group justify="space-between" mb="lg">
        <Text size="lg" weight={700}>Resumen Anual: Ingresos vs. Gastos</Text>
        <Select
          label="Año"
          data={years}
          value={selectedYear}
          onChange={onYearChange}
          style={{ width: 120 }}
        />
      </Group>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`} />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="total_ingresos" fill="#40C057" name="Ingresos" />
          <Bar dataKey="total_gastos" fill="#FA5252" name="Gastos" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

import { Group } from '@mantine/core'; // Aseguramos que Group esté importado
export default MonthlySummaryChart;