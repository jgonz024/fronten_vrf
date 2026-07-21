const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/roles`;

export async function fetchRoles() {
  const res = await fetch(API_URL);
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

export async function createRol(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear rol');
  }
  const json = await res.json();
  return json.data;
}

export async function updateRol(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
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
