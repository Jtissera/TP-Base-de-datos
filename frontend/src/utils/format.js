// Helpers para convertir entre el formato de los inputs HTML (date/time)
// y el formato que espera la API (DATE / TIME de PostgreSQL).

export const todayStr = () => new Date().toISOString().slice(0, 10);

// input type="time" entrega "HH:MM"; la API espera "HH:MM:SS"
export const toApiTime = (t) => (t && t.length === 5 ? `${t}:00` : t || '');

// la API devuelve "HH:MM:SS"; los inputs necesitan "HH:MM"
export const toInputTime = (t) => (t ? t.slice(0, 5) : '');

// normaliza un valor de fecha (string ISO o "YYYY-MM-DD") a "DD/MM/AAAA"
export const formatDate = (d) => {
  if (!d) return '';
  const datePart = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  const [y, m, day] = datePart.split('-');
  return `${day}/${m}/${y}`;
};
