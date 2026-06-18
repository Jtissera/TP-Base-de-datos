import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewReservation from './pages/NewReservation';
import MyReservations from './pages/MyReservations';
import AllReservations from './pages/AllReservations';
import Classrooms from './pages/Classrooms';
import Subjects from './pages/Subjects';
import AuditLogs from './pages/AuditLogs';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ marginTop: '50px' }}>Cargando aplicación...</div>;
  }

  const isAdmin = user?.role === 'administrator';

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      {/* Rutas privadas, dentro del layout con navbar */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="reservas/nueva" element={<NewReservation />} />
        {!isAdmin && <Route path="reservas/mias" element={<MyReservations />} />}
        {isAdmin && <Route path="reservas" element={<AllReservations />} />}
        {isAdmin && <Route path="aulas" element={<Classrooms />} />}
        <Route path="materias" element={<Subjects />} />
        {isAdmin && <Route path="auditoria" element={<AuditLogs />} />}
      </Route>

      {/* Fallback para rutas no encontradas o no permitidas para el rol actual */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
