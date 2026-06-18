import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatDate, toInputTime } from '../utils/format';

export default function AllReservations() {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [filters, setFilters] = useState({ date: '', classroomId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get('/classrooms').then((res) => setClassrooms(res.data)).catch(() => setClassrooms([]));
    load();
  }, []);

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reservations', { params });
      setReservations(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.classroomId) params.classroomId = filters.classroomId;
    load(params);
  };

  const clearFilters = () => {
    setFilters({ date: '', classroomId: '' });
    load();
  };

  const cancelReservation = async (r) => {
    if (!window.confirm(`¿Cancelar la reserva de ${r.teacher_name} del ${formatDate(r.date)}?`)) return;
    setCancellingId(r.id);
    setSuccess(''); setError('');
    try {
      await api.patch(`/reservations/${r.id}/cancel`);
      setSuccess('Reserva cancelada.');
      load({ date: filters.date || undefined, classroomId: filters.classroomId || undefined });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cancelar la reserva.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Reservas</h1>
          <p>Todas las reservas registradas en el sistema.</p>
        </div>
      </div>

      <div className="card">
        <h3>Filtros</h3>
        <form onSubmit={applyFilters}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="filterDate">Fecha</label>
              <input id="filterDate" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="filterClassroom">Aula</label>
              <select id="filterClassroom" value={filters.classroomId} onChange={(e) => setFilters({ ...filters, classroomId: e.target.value })}>
                <option value="">Todas</option>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row-actions">
            <button type="submit" className="btn btn-primary">Filtrar</button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : reservations.length === 0 ? (
        <div className="card"><div className="empty-state">No hay reservas para los filtros seleccionados.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Aula</th>
                <th>Materia</th>
                <th>Docente</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{toInputTime(r.start_time)} - {toInputTime(r.end_time)}</td>
                  <td>{r.classroom_name}</td>
                  <td>{r.subject_name}</td>
                  <td>{r.teacher_name} <span style={{ fontSize: '12px', color: 'var(--text)' }}>({r.teacher_email})</span></td>
                  <td><span className={`badge ${r.status === 'active' ? 'badge-active' : 'badge-cancelled'}`}>{r.status === 'active' ? 'Activa' : 'Cancelada'}</span></td>
                  <td>
                    {r.status === 'active' && (
                      <button className="btn btn-danger btn-sm" disabled={cancellingId === r.id} onClick={() => cancelReservation(r)}>
                        {cancellingId === r.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
