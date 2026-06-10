import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido, {user?.name}</h1>
      <p>Tu rol es: <strong>{user?.role}</strong></p>
      <button onClick={logout} style={{ marginTop: '20px', padding: '10px' }}>Cerrar Sesión</button>
    </div>
  );
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ marginTop: '50px' }}>Cargando aplicación...</div>;
  }

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      {/* Rutas Privadas */}
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      
      {/* Fallback para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;