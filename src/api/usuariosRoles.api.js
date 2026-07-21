const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/usuarios-roles`;

export async function fetchUsuariosRoles() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al conectar con la API de asignaciones');
  const json = await res.json();
  return json.data;
}

export async function fetchUsuarioRolById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener la asignación');
  const json = await res.json();
  return json.data;
}

export async function saveUserRolesApi(usuarioId, roleIds) {
  const numUserId = Number(usuarioId);
  const numRoleIds = roleIds.map(Number);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: numUserId, role_ids: numRoleIds })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al guardar roles del usuario');
  }
  const json = await res.json();
  return json.data;
}

export async function createUsuarioRol(data) {
  if (data.role_ids && Array.isArray(data.role_ids)) {
    return saveUserRolesApi(data.usuario_id, data.role_ids);
  }
  return saveUserRolesApi(data.usuario_id, [data.rol_id]);
}

export async function updateUsuarioRol(id, data) {
  if (data.role_ids && Array.isArray(data.role_ids)) {
    return saveUserRolesApi(data.usuario_id, data.role_ids);
  }
  return saveUserRolesApi(data.usuario_id, [data.rol_id]);
}

export async function deleteUsuarioRol(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar asignación');
  return await res.json();
}
