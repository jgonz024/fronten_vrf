const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/activos`;

export async function fetchActivos(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de activos');
  const json = await res.json();
  return json.data;
}

export async function fetchActivoById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener el activo');
  const json = await res.json();
  return json.data;
}

export async function createActivo(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear el activo');
  }
  const json = await res.json();
  return json.data;
}

export async function updateActivo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar el activo');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteActivo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar el activo');
  return await res.json();
}

export async function restoreActivo(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'PUT' });
  if (!res.ok) throw new Error('Error al restaurar el activo');
  const json = await res.json();
  return json.data;
}
