const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/roles`;

let localRoles = [
  { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Acceso total al sistema de gestión VRF' },
  { id: 2, nombre: 'TECNICO', descripcion: 'Técnico de soporte y mantenimiento en terreno' },
  { id: 3, nombre: 'SUPERVISOR', descripcion: 'Supervisión de cuadrillas y aprobación de órdenes' },
  { id: 4, nombre: 'CLIENTE', descripcion: 'Acceso a reporte de solicitudes y estado de equipos' }
];

export async function fetchRoles() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al conectar con la API de roles');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API roles no disponible, usando estado local:', err.message);
    return localRoles;
  }
}

export async function fetchRolById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener rol');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return localRoles.find(r => r.id === Number(id)) || null;
  }
}

export async function createRol(data) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear rol');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const newId = localRoles.length > 0 ? Math.max(...localRoles.map(r => r.id)) + 1 : 1;
    const created = { id: newId, ...data };
    localRoles.push(created);
    return created;
  }
}

export async function updateRol(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar rol');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const index = localRoles.findIndex(r => r.id === Number(id));
    if (index !== -1) {
      localRoles[index] = { ...localRoles[index], ...data };
      return localRoles[index];
    }
    throw new Error('Rol no encontrado');
  }
}

export async function deleteRol(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar rol');
    return await res.json();
  } catch (err) {
    localRoles = localRoles.filter(r => r.id !== Number(id));
    return { success: true, id };
  }
}
