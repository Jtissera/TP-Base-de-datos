import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Subjects() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'administrator';

  const [subjects, setSubjects] = useState([]);
  const [mySubjectIds, setMySubjectIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const requests = [api.get('/subjects')];
      if (!isAdmin) requests.push(api.get('/subjects/my-subjects'));
      const [allRes, mineRes] = await Promise.all(requests);
      setSubjects(allRes.data);
      if (mineRes) setMySubjectIds(mineRes.data.map((s) => s.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar las materias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setCreating(true);
    try {
      await api.post('/subjects', { name: newName });
      setSuccess('Materia creada correctamente.');
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la materia.');
    } finally {
      setCreating(false);
    }
  };

  const toggleSubject = (id) => {
    setMySubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const saveMySubjects = async () => {
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.post('/subjects/my-subjects', { subjectIds: mySubjectIds });
      setSuccess('Tus materias se guardaron correctamente.');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron guardar tus materias.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Materias</h1>
          <p>
            {isAdmin
              ? 'Catálogo de materias de la facultad.'
              : 'Elegí las materias que dictás para poder reservar aulas en su nombre.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isAdmin && (
        <div className="card">
          <h3>Nueva materia</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="subjectName">Nombre</label>
                <input id="subjectName" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
            </div>
            <div className="form-row-actions">
              <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creando...' : 'Crear materia'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>{isAdmin ? 'Catálogo completo' : 'Catálogo y selección personal'}</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : subjects.length === 0 ? (
          <div className="empty-state">Todavía no hay materias registradas.</div>
        ) : isAdmin ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th></tr></thead>
              <tbody>
                {subjects.map((s) => <tr key={s.id}><td>{s.name}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="checkbox-list">
              {subjects.map((s) => (
                <label key={s.id} className="checkbox-row">
                  <input type="checkbox" checked={mySubjectIds.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
            <div className="form-row-actions">
              <button className="btn btn-primary" disabled={saving} onClick={saveMySubjects}>
                {saving ? 'Guardando...' : 'Guardar mis materias'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
