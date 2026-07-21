import { saveUserRolesApi } from './usuariosRoles.api';
import { fetchRoles } from './roles.api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/usuarios`;

let localUsuarios = [
  { id: 1, nombre: 'Juan Carlos Gómez', email: 'admin@vrfsystems.cl', telefono: '+56 9 1234 5678', foto_url: '/uploads/usuarios/admin_avatar.png', activo: true, debe_cambiar_password: false, roles: [{ id: 1, nombre: 'ADMINISTRADOR' }, { id: 3, nombre: 'SUPERVISOR' }], creado_en: new Date().toISOString() },
  { id: 2, nombre: 'Marcelo Silva', email: 'tecnico.silva@vrfsystems.cl', telefono: '+56 9 8765 4321', foto_url: null, activo: true, debe_cambiar_password: true, roles: [{ id: 2, nombre: 'TECNICO' }], creado_en: new Date().toISOString() },
  { id: 3, nombre: 'Empresa ClimaCool SpA', email: 'contacto@climacool.cl', telefono: '+56 2 2999 8888', foto_url: null, activo: true, debe_cambiar_password: true, roles: [{ id: 4, nombre: 'CLIENTE' }], creado_en: new Date().toISOString() }
];

export async function fetchUsuarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al conectar con la API de usuarios');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API usuarios no disponible, usando estado local:', err.message);
    return localUsuarios;
  }
}

export async function fetchUsuarioById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener usuario');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return localUsuarios.find(u => u.id === Number(id)) || null;
  }
}

export async function createUsuario(data) {
  const roleIds = data.role_ids || [];
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear usuario');
    const json = await res.json();
    const newUser = json.data;

    if (roleIds.length > 0) {
      await saveUserRolesApi(newUser.id, roleIds);
    }
    return newUser;
  } catch (err) {
    const newId = localUsuarios.length > 0 ? Math.max(...localUsuarios.map(u => u.id)) + 1 : 1;
    const allRoles = await fetchRoles();
    const assignedRoles = allRoles.filter(r => roleIds.includes(Number(r.id)));

    const created = {
      id: newId,
      ...data,
      activo: data.activo ?? true,
      debe_cambiar_password: true,
      roles: assignedRoles,
      creado_en: new Date().toISOString()
    };
    localUsuarios.push(created);

    if (roleIds.length > 0) {
      await saveUserRolesApi(newId, roleIds, localUsuarios, allRoles);
    }
    return created;
  }
}

export async function updateUsuario(id, data) {
  const roleIds = data.role_ids;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    const json = await res.json();
    const updated = json.data;

    if (roleIds && Array.isArray(roleIds)) {
      await saveUserRolesApi(id, roleIds);
    }
    return updated;
  } catch (err) {
    const index = localUsuarios.findIndex(u => u.id === Number(id));
    if (index !== -1) {
      const allRoles = await fetchRoles();
      let assignedRoles = localUsuarios[index].roles || [];
      if (roleIds && Array.isArray(roleIds)) {
        assignedRoles = allRoles.filter(r => roleIds.includes(Number(r.id)));
        await saveUserRolesApi(id, roleIds, localUsuarios, allRoles);
      }

      localUsuarios[index] = {
        ...localUsuarios[index],
        ...data,
        roles: assignedRoles
      };
      return localUsuarios[index];
    }
    throw new Error('Usuario no encontrado');
  }
}

export async function resetPasswordAdminApi(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Error al restablecer la contraseña');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const index = localUsuarios.findIndex(u => u.id === Number(id));
    if (index !== -1) {
      localUsuarios[index].debe_cambiar_password = true;
      return { success: true, message: 'Contraseña restablecida por defecto a Vrf12345' };
    }
    throw new Error('Usuario no encontrado');
  }
}

export async function deleteUsuario(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar usuario');
    return await res.json();
  } catch (err) {
    localUsuarios = localUsuarios.filter(u => u.id !== Number(id));
    return { success: true, id };
  }
}
