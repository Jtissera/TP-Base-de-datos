import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = { name: '', capacity: '', location: '' };

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar las aulas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setCreating(true);
    try {
      await api.post('/classrooms', {
        name: form.name,
        capacity: Number(form.capacity),
        location: form.location,
      });
      setSuccess('Aula creada correctamente.');
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el aula.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c) => {
    setError(''); setSuccess('');
    setEditingId(c.id);
    setEditForm({ name: c.name, capacity: c.capacity, location: c.location });
  };

  const saveEdit = async () => {
    setError(''); setSuccess('');
    try {
      await api.put(`/classrooms/${editingId}`, {
        name: editForm.name,
        capacity: Number(editForm.capacity),
        location: editForm.location,
      });
      setSuccess('Aula actualizada correctamente.');
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar el aula.');
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar el aula "${c.name}"? Esta acción no se puede deshacer.`)) return;
    setError(''); setSuccess('');
    try {
      await api.delete(`/classrooms/${c.id}`);
      setSuccess('Aula eliminada correctamente.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el aula.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Aulas</h1>
          <p>Alta, edición y baja de aulas disponibles para reserva.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Nueva aula</h3>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Capacidad</label>
              <input id="capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="location">Ubicación</label>
              <input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
          </div>
          <div className="form-row-actions">
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creando...' : 'Crear aula'}</button>
          </div>
        </form>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Capacidad</th><th>Ubicación</th><th></th></tr>
            </thead>
            <tbody>
              {classrooms.map((c) => (
                editingId === c.id ? (
                  <tr key={c.id}>
                    <td><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                    <td><input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} /></td>
                    <td><input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>Guardar</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.capacity}</td>
                    <td>{c.location}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {classrooms.length === 0 && (
                <tr><td colSpan={4}><div className="empty-state">Todavía no hay aulas registradas.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
