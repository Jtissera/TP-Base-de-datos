import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { todayStr, toApiTime } from '../utils/format';

export default function NewReservation() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'administrator';

  const [subjects, setSubjects] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [classrooms, setClassrooms] = useState(null); // null = todavía no se buscó
  const [searching, setSearching] = useState(false);
  const [reservingId, setReservingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const endpoint = isAdmin ? '/subjects' : '/subjects/my-subjects';
    api.get(endpoint)
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, [isAdmin]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!date || !startTime || !endTime) {
      setError('Completá fecha, hora de inicio y hora de fin.');
      return;
    }
    if (startTime >= endTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setSearching(true);
    setClassrooms(null);
    try {
      const res = await api.get('/classrooms/availability', {
        params: { date, startTime: toApiTime(startTime), endTime: toApiTime(endTime) },
      });
      setClassrooms(res.data.availableClassrooms);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar aulas disponibles.');
    } finally {
      setSearching(false);
    }
  };

  const handleReserve = async (classroom) => {
    setError('');
    setSuccess('');

    if (!subjectId) {
      setError('Seleccioná una materia antes de reservar.');
      return;
    }

    setReservingId(classroom.id);
    try {
      const res = await api.post('/reservations', {
        classroomId: classroom.id,
        subjectId: Number(subjectId),
        userId: user.id,
        date,
        startTime: toApiTime(startTime),
        endTime: toApiTime(endTime),
        userEmail: user.email,
        classroomName: classroom.name,
      });
      setSuccess(`Reserva creada con éxito (#${res.data.reservationId}) para el aula ${classroom.name}.`);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroom.id));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la reserva.');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Nueva reserva</h1>
          <p>Buscá un horario y elegí entre las aulas disponibles.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Datos de la reserva</h3>
        <form onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input id="date" type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Hora de inicio</label>
              <input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">Hora de fin</label>
              <input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Materia</label>
              <select id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row-actions">
            <button type="submit" className="btn btn-primary" disabled={searching}>
              {searching ? 'Buscando...' : 'Buscar aulas disponibles'}
            </button>
          </div>
        </form>
        {!isAdmin && subjects.length === 0 && (
          <p style={{ marginTop: '12px', fontSize: '13px' }}>
            Todavía no tenés materias asignadas. Elegilas en la sección <strong>Materias</strong> para poder reservar.
          </p>
        )}
      </div>

      {classrooms !== null && (
        <div className="card">
          <h3>Aulas disponibles</h3>
          {classrooms.length === 0 ? (
            <div className="empty-state">No hay aulas disponibles para ese horario.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Aula</th>
                    <th>Capacidad</th>
                    <th>Ubicación</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {classrooms.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.capacity}</td>
                      <td>{c.location}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReserve(c)}
                          disabled={reservingId === c.id}
                        >
                          {reservingId === c.id ? 'Reservando...' : 'Reservar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
