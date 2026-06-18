import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const teacherLinks = [
  { to: '/reservas/nueva', title: 'Nueva reserva', desc: 'Buscá un aula disponible y reservala para tu clase.' },
  { to: '/reservas/mias', title: 'Mis reservas', desc: 'Consultá, modificá o cancelá tus reservas activas.' },
  { to: '/materias', title: 'Mis materias', desc: 'Elegí las materias que dictás para poder reservar aulas.' },
];

const adminLinks = [
  { to: '/reservas/nueva', title: 'Nueva reserva', desc: 'Reservá un aula en nombre de la institución.' },
  { to: '/reservas', title: 'Reservas', desc: 'Visualizá todas las reservas del sistema y cancelalas si es necesario.' },
  { to: '/aulas', title: 'Aulas', desc: 'Dar de alta, editar o eliminar aulas.' },
  { to: '/materias', title: 'Materias', desc: 'Administrá el catálogo de materias.' },
  { to: '/auditoria', title: 'Auditoría', desc: 'Revisá el historial de operaciones registrado en MongoDB.' },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'administrator';
  const links = isAdmin ? adminLinks : teacherLinks;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '32px', margin: 0 }}>Hola, {user?.name}</h1>
          <p>Bienvenido al sistema de gestión y reserva de aulas universitarias.</p>
        </div>
      </div>

      <div className="grid-cards">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="link-card">
            <strong>{l.title}</strong>
            <span>{l.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
