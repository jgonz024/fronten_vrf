const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/usuarios-roles`;

let localUsuariosRoles = [
  { id: 1, usuario_id: 1, rol_id: 1, usuario_nombre: 'Juan Carlos Gómez', rol_nombre: 'ADMINISTRADOR', asignado_en: new Date().toISOString() },
  { id: 2, usuario_id: 1, rol_id: 3, usuario_nombre: 'Juan Carlos Gómez', rol_nombre: 'SUPERVISOR', asignado_en: new Date().toISOString() },
  { id: 3, usuario_id: 2, rol_id: 2, usuario_nombre: 'Marcelo Silva', rol_nombre: 'TECNICO', asignado_en: new Date().toISOString() },
  { id: 4, usuario_id: 3, rol_id: 4, usuario_nombre: 'Empresa ClimaCool SpA', rol_nombre: 'CLIENTE', asignado_en: new Date().toISOString() }
];

export async function fetchUsuariosRoles() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al conectar con la API de asignaciones');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API usuarios-roles no disponible, usando estado local:', err.message);
    return localUsuariosRoles;
  }
}

export async function fetchUsuarioRolById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener la asignación');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return localUsuariosRoles.find(x => x.id === Number(id)) || null;
  }
}

export async function saveUserRolesApi(usuarioId, roleIds, usuariosList = [], rolesList = []) {
  const numUserId = Number(usuarioId);
  const numRoleIds = roleIds.map(Number);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: numUserId, role_ids: numRoleIds })
    });
    if (!res.ok) throw new Error('Error al guardar roles del usuario');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Guardando múltiples roles en estado local:', err.message);
    localUsuariosRoles = localUsuariosRoles.filter(ur => ur.usuario_id !== numUserId);

    const usr = usuariosList.find(u => u.id === numUserId);
    for (const rId of numRoleIds) {
      const rl = rolesList.find(r => r.id === rId);
      const newId = localUsuariosRoles.length > 0 ? Math.max(...localUsuariosRoles.map(x => x.id)) + 1 : 1;
      localUsuariosRoles.push({
        id: newId,
        usuario_id: numUserId,
        rol_id: rId,
        usuario_nombre: usr ? usr.nombre : `Usuario #${numUserId}`,
        rol_nombre: rl ? rl.nombre : `Rol #${rId}`,
        asignado_en: new Date().toISOString()
      });
    }
    return localUsuariosRoles;
  }
}

export async function createUsuarioRol(data, usuariosList = [], rolesList = []) {
  if (data.role_ids && Array.isArray(data.role_ids)) {
    return saveUserRolesApi(data.usuario_id, data.role_ids, usuariosList, rolesList);
  }
  return saveUserRolesApi(data.usuario_id, [data.rol_id], usuariosList, rolesList);
}

export async function updateUsuarioRol(id, data, usuariosList = [], rolesList = []) {
  if (data.role_ids && Array.isArray(data.role_ids)) {
    return saveUserRolesApi(data.usuario_id, data.role_ids, usuariosList, rolesList);
  }
  return saveUserRolesApi(data.usuario_id, [data.rol_id], usuariosList, rolesList);
}

export async function deleteUsuarioRol(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar asignación');
    return await res.json();
  } catch (err) {
    localUsuariosRoles = localUsuariosRoles.filter(x => x.id !== Number(id));
    return { success: true, id };
  }
}
