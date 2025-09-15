import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance'; // Nuestra instancia de Axios configurada
import AddAccountForm from '../components/AddAccountForm'; // Componente para añadir cuentas
import AddCategoryForm from '../components/AddCategoryForm'; // Componente para añadir categorías
import GenericModal from '../components/GenericModal'; // Importa nuestro modal genérico

function Dashboard() {
  // Creamos un estado para guardar la lista de cuentas
  const [accounts, setAccounts] = useState([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  // Estados para las Categorías
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  // Creamos un estado para saber si estamos cargando los datos
  const [loading, setLoading] = useState(true);
  // Creamos un estado para guardar cualquier error que ocurra
  const [error, setError] = useState(null);


  // Función para buscar AMBAS cosas: cuentas y categorías
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Hacemos las dos peticiones a la vez para más eficiencia
      const [accountsResponse, categoriesResponse] = await Promise.all([
        axiosInstance.get('/cuentas/'),
        axiosInstance.get('/categorias/')
      ]);
      setAccounts(accountsResponse.data);
      setCategories(categoriesResponse.data); // <-- Guarda las categorías
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Usamos useEffect para que el código se ejecute solo una vez, cuando el componente se carga por primera vez.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

 // Función unificada para cuando se añade algo nuevo
  const handleItemAdded = () => {
    setIsAccountModalOpen(false);
    setIsCategoryModalOpen(false); // Cierra ambos modales por si acaso
    fetchData(); // Recarga TODOS los datos
  };

  // Mostramos diferentes cosas dependiendo del estado
  if (loading) {
    return <p>Cargando tus datos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Tu Dashboard</h1>

      {/* Sección de Cuentas */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Mis Cuentas</h2>
          {/* Botón para abrir el modal */}
          <button onClick={() => setIsAccountModalOpen(true)}>Añadir Cuenta</button>
        </div>
        {accounts.length > 0 ? (
          <ul>
            {accounts.map(acc => <li key={acc.id}><strong>{acc.nombre}</strong> ({acc.tipo}) - Saldo: ${acc.saldo_inicial.toLocaleString()}</li>)}
          </ul>
        ) : <p>Aún no tienes cuentas.</p>}
      </div>

      {/* Sección de Categorías */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Mis Categorías</h2>
          <button onClick={() => setIsCategoryModalOpen(true)}>Añadir Categoría</button>
        </div>
        {categories.length > 0 ? (
          <ul>
            {categories.map(cat => <li key={cat.id}><strong>{cat.nombre}</strong> ({cat.tipo})</li>)}
          </ul>
        ) : <p>Aún no tienes categorías.</p>}
      </div>

      {/* Modal para Cuentas */}
      <GenericModal 
        isOpen={isAccountModalOpen} 
        onRequestClose={() => setIsAccountModalOpen(false)}
      >
        <AddAccountForm onAccountAdded={handleItemAdded} />
      </GenericModal>

      {/* Modal para Categorías */}
      <GenericModal 
        isOpen={isCategoryModalOpen} 
        onRequestClose={() => setIsCategoryModalOpen(false)}
      >
        <AddCategoryForm onCategoryAdded={handleItemAdded} />
      </GenericModal>

    </div>
  );
}

export default Dashboard;