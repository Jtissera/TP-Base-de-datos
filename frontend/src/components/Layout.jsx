import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'administrator';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', width: '100%' }}>
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="nav-brand">Gestión de Aulas · FIUBA</NavLink>

          <nav className="nav-links">
            <NavLink to="/" end className={linkClass}>Inicio</NavLink>
            <NavLink to="/reservas/nueva" className={linkClass}>Nueva reserva</NavLink>
            {!isAdmin && <NavLink to="/reservas/mias" className={linkClass}>Mis reservas</NavLink>}
            {isAdmin && <NavLink to="/reservas" className={linkClass}>Reservas</NavLink>}
            {isAdmin && <NavLink to="/aulas" className={linkClass}>Aulas</NavLink>}
            <NavLink to="/materias" className={linkClass}>Materias</NavLink>
            {isAdmin && <NavLink to="/auditoria" className={linkClass}>Auditoría</NavLink>}
          </nav>

          <div className="nav-user">
            <span>{user?.name}</span>
            <span className="nav-role">{isAdmin ? 'Admin' : 'Docente'}</span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
