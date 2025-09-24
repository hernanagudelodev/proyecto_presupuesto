import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Text, Group, Select } from '@mantine/core';

// Una paleta de colores para que cada categoría tenga un color distinto
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

function CategoryExpensesChart({ data, selectedMonth, selectedYear, onMonthChange, onYearChange }) {
  const chartData = data.map(item => ({
    name: item.nombre_categoria,
    value: item.total_gastado,
  }));
  
  // Generamos listas para los selectores de mes y año
  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('es-CO', { month: 'long' }) }));
  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <Paper withBorder shadow="sm" p="md" style={{ height: '400px' }}>
      <Group justify="space-between" mb="lg">
        <Text size="lg" weight={700}>Gastos por Categoría</Text>
        {/* Filtros para que el usuario pueda cambiar el mes y año */}
        <Group>
          <Select
            data={months}
            value={selectedMonth}
            onChange={onMonthChange}
            style={{ width: 120 }}
          />
          <Select
            data={years}
            value={selectedYear}
            onChange={onYearChange}
            style={{ width: 100 }}
          />
        </Group>
      </Group>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            {/* El Tooltip muestra los detalles al pasar el mouse sobre una porción */}
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            {/* La leyenda muestra el nombre de cada categoría */}
            <Legend />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60} // Esto lo convierte en un gráfico de "dona"
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Text color="dimmed" align="center" style={{ paddingTop: '5rem' }}>
          No hay datos de gastos para este mes.
        </Text>
      )}
    </Paper>
  );
}

export default CategoryExpensesChart;