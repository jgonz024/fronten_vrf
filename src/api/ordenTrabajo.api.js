const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/orden-trabajo`;

export async function fetchOrdenesTrabajo(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de órdenes de trabajo');
  const json = await res.json();
  return json.data;
}

export async function fetchOrdenTrabajoById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener orden de trabajo');
  const json = await res.json();
  return json.data;
}

export async function createOrdenTrabajo(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear orden de trabajo');
  }
  const json = await res.json();
  return json.data;
}

export async function updateOrdenTrabajo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar orden de trabajo');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteOrdenTrabajo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar orden de trabajo');
  return await res.json();
}

export async function restoreOrdenTrabajo(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar orden de trabajo');
  const json = await res.json();
  return json.data;
}
