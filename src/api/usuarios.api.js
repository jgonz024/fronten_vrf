const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/usuarios`;

export async function fetchUsuarios() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al conectar con la API de usuarios');
  const json = await res.json();
  return json.data;
}

export async function fetchUsuarioById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener usuario');
  const json = await res.json();
  return json.data;
}

export async function createUsuario(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear usuario');
  }
  const json = await res.json();
  return json.data;
}

export async function updateUsuario(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar usuario');
  }
  const json = await res.json();
  return json.data;
}

export async function resetPasswordAdminApi(id) {
  const res = await fetch(`${API_URL}/${id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al restablecer la contraseña');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteUsuario(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return await res.json();
}
