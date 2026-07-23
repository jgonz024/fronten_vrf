const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/tipo-ot`;

export async function fetchTiposOt(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de tipos de OT');
  const json = await res.json();
  return json.data;
}

export async function fetchTipoOtById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener tipo de OT');
  const json = await res.json();
  return json.data;
}

export async function createTipoOt(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear tipo de OT');
  }
  const json = await res.json();
  return json.data;
}

export async function updateTipoOt(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar tipo de OT');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteTipoOt(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar tipo de OT');
  return await res.json();
}

export async function restoreTipoOt(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar tipo de OT');
  const json = await res.json();
  return json.data;
}
