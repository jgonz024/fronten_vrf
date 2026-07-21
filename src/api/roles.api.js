const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/roles`;

export async function fetchRoles(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de roles');
  const json = await res.json();
  return json.data;
}

export async function fetchRolById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener rol');
  const json = await res.json();
  return json.data;
}

export async function createRol(rolData) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rolData)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear rol');
  }
  const json = await res.json();
  return json.data;
}

export async function updateRol(id, rolData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rolData)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar rol');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteRol(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar rol');
  return await res.json();
}

export async function restoreRol(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar rol');
  const json = await res.json();
  return json.data;
}
