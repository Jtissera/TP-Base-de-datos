import { useEffect, useState } from 'react';
import api from '../api/axios';

const actionBadge = {
  CREATE: 'badge-create',
  UPDATE: 'badge-update',
  CANCEL: 'badge-cancel',
};

const actionLabel = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  CANCEL: 'Cancelación',
};

const emptyFilters = { actionType: '', userEmail: '', classroomName: '', startDate: '', endDate: '' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/logs', { params });
      setLogs(res.data.logs);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    load(params);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Auditoría</h1>
          <p>Historial de operaciones sobre reservas, registrado en MongoDB.</p>
        </div>
      </div>

      <div className="card">
        <h3>Filtros</h3>
        <form onSubmit={applyFilters}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="actionType">Tipo de acción</label>
              <select id="actionType" value={filters.actionType} onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}>
                <option value="">Todas</option>
                <option value="CREATE">Creación</option>
                <option value="UPDATE">Modificación</option>
                <option value="CANCEL">Cancelación</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="userEmail">Email del docente</label>
              <input id="userEmail" value={filters.userEmail} onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })} placeholder="ej: docente@fiuba.edu" />
            </div>
            <div className="form-group">
              <label htmlFor="classroomName">Aula</label>
              <input id="classroomName" value={filters.classroomName} onChange={(e) => setFilters({ ...filters, classroomName: e.target.value })} placeholder="ej: Aula 5" />
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Desde</label>
              <input id="startDate" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Hasta</label>
              <input id="endDate" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
          </div>
          <div className="form-row-actions">
            <button type="submit" className="btn btn-primary">Filtrar</button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : logs.length === 0 ? (
        <div className="card"><div className="empty-state">No hay registros para los filtros seleccionados.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha de operación</th>
                <th>Acción</th>
                <th>Docente</th>
                <th>Aula</th>
                <th>Reserva</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`${log.reservationDetails?.reservationId}-${log.actionType}-${log.operationDate}`}>
                  <td>{new Date(log.operationDate).toLocaleString('es-AR')}</td>
                  <td><span className={`badge ${actionBadge[log.actionType] || ''}`}>{actionLabel[log.actionType] || log.actionType}</span></td>
                  <td>{log.user?.email}</td>
                  <td>{log.classroom?.name}</td>
                  <td>
                    #{log.reservationDetails?.reservationId} · {log.reservationDetails?.reservationDate?.slice(0, 10)}{' '}
                    {log.reservationDetails?.startTime?.slice(0, 5)}-{log.reservationDetails?.endTime?.slice(0, 5)}
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
