const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/tecnicos-ot`;

export async function fetchTecnicosOt(parentVal = null, includeDeleted = false) {
  let url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  if (parentVal) {
    url += includeDeleted ? `&id_ot=${parentVal}` : `?id_ot=${parentVal}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API');
  const json = await res.json();
  return json.data;
}

export async function createTecnicoOt(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al registrar');
  }
  const json = await res.json();
  return json.data;
}

export async function updateTecnicoOt(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteTecnicoOt(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar');
  return await res.json();
}

export async function restoreTecnicoOt(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar');
  const json = await res.json();
  return json.data;
}
