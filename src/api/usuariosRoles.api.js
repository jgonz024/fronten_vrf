const API_URL = 'http://localhost:3000/api/usuarios-roles';

let localUsuariosRoles = [
  { id: 1, usuario_id: 1, rol_id: 1, usuario_nombre: 'Juan Carlos Gómez', rol_nombre: 'ADMINISTRADOR', asignado_en: new Date().toISOString() },
  { id: 2, usuario_id: 2, rol_id: 2, usuario_nombre: 'Marcelo Silva', rol_nombre: 'TECNICO', asignado_en: new Date().toISOString() },
  { id: 3, usuario_id: 3, rol_id: 4, usuario_nombre: 'Empresa ClimaCool SpA', rol_nombre: 'CLIENTE', asignado_en: new Date().toISOString() }
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

export async function createUsuarioRol(data, usuariosList = [], rolesList = []) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear asignación');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const newId = localUsuariosRoles.length > 0 ? Math.max(...localUsuariosRoles.map(x => x.id)) + 1 : 1;
    const usr = usuariosList.find(u => u.id === Number(data.usuario_id));
    const rl = rolesList.find(r => r.id === Number(data.rol_id));
    const created = {
      id: newId,
      usuario_id: Number(data.usuario_id),
      rol_id: Number(data.rol_id),
      usuario_nombre: usr ? usr.nombre : `Usuario #${data.usuario_id}`,
      rol_nombre: rl ? rl.nombre : `Rol #${data.rol_id}`,
      asignado_en: new Date().toISOString()
    };
    localUsuariosRoles.push(created);
    return created;
  }
}

export async function updateUsuarioRol(id, data, usuariosList = [], rolesList = []) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar asignación');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const index = localUsuariosRoles.findIndex(x => x.id === Number(id));
    if (index !== -1) {
      const usr = usuariosList.find(u => u.id === Number(data.usuario_id));
      const rl = rolesList.find(r => r.id === Number(data.rol_id));
      localUsuariosRoles[index] = {
        ...localUsuariosRoles[index],
        usuario_id: Number(data.usuario_id),
        rol_id: Number(data.rol_id),
        usuario_nombre: usr ? usr.nombre : localUsuariosRoles[index].usuario_nombre,
        rol_nombre: rl ? rl.nombre : localUsuariosRoles[index].rol_nombre
      };
      return localUsuariosRoles[index];
    }
    throw new Error('Asignación no encontrada');
  }
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
