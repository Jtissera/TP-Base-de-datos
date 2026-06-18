import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatDate, toApiTime, toInputTime, todayStr } from '../utils/format';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [resReservations, resClassrooms] = await Promise.all([
        api.get('/reservations/my-reservations'),
        api.get('/classrooms'),
      ]);
      setReservations(resReservations.data);
      setClassrooms(resClassrooms.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (r) => {
    setError(''); setSuccess('');
    setEditingId(r.id);
    setEditForm({
      classroomId: classrooms.find((c) => c.name === r.classroom_name)?.id || '',
      date: r.date.slice(0, 10),
      startTime: toInputTime(r.start_time),
      endTime: toInputTime(r.end_time),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (r) => {
    setSavingEdit(true);
    setError(''); setSuccess('');
    try {
      const classroom = classrooms.find((c) => c.id === Number(editForm.classroomId));
      await api.put(`/reservations/${r.id}`, {
        classroomId: Number(editForm.classroomId),
        date: editForm.date,
        startTime: toApiTime(editForm.startTime),
        endTime: toApiTime(editForm.endTime),
        classroomName: classroom?.name,
      });
      setSuccess('Reserva actualizada correctamente.');
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar la reserva.');
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelReservation = async (r) => {
    if (!window.confirm(`¿Cancelar la reserva del ${formatDate(r.date)}?`)) return;
    setCancellingId(r.id);
    setError(''); setSuccess('');
    try {
      await api.patch(`/reservations/${r.id}/cancel`);
      setSuccess('Reserva cancelada.');
      load();
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
          <h1 style={{ fontSize: '28px', margin: 0 }}>Mis reservas</h1>
          <p>Reservas que realizaste, ordenadas por fecha.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : reservations.length === 0 ? (
        <div className="card"><div className="empty-state">Todavía no hiciste ninguna reserva.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Aula</th>
                <th>Materia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                editingId === r.id ? (
                  <tr key={r.id}>
                    <td>
                      <input
                        type="date"
                        min={todayStr()}
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} />
                        <input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} />
                      </div>
                    </td>
                    <td>
                      <select value={editForm.classroomId} onChange={(e) => setEditForm({ ...editForm, classroomId: e.target.value })}>
                        {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td>{r.subject_name}</td>
                    <td><span className="badge badge-active">Activa</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary btn-sm" disabled={savingEdit} onClick={() => saveEdit(r)}>
                          {savingEdit ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td>{toInputTime(r.start_time)} - {toInputTime(r.end_time)}</td>
                    <td>{r.classroom_name} <span style={{ fontSize: '12px', color: 'var(--text)' }}>({r.classroom_location})</span></td>
                    <td>{r.subject_name}</td>
                    <td><span className={`badge ${r.status === 'active' ? 'badge-active' : 'badge-cancelled'}`}>{r.status === 'active' ? 'Activa' : 'Cancelada'}</span></td>
                    <td>
                      {r.status === 'active' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>Editar</button>
                          <button className="btn btn-danger btn-sm" disabled={cancellingId === r.id} onClick={() => cancelReservation(r)}>
                            {cancellingId === r.id ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
