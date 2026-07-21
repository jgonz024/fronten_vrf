const API_URL = 'http://localhost:3000/api/usuarios';

// Fallback local en memoria si el backend no está corriendo en localhost:3000
let localUsuarios = [
  { id: 1, nombre: 'Juan Carlos Gómez', email: 'admin@vrfsystems.cl', telefono: '+56 9 1234 5678', activo: true, creado_en: new Date().toISOString() },
  { id: 2, nombre: 'Marcelo Silva', email: 'tecnico.silva@vrfsystems.cl', telefono: '+56 9 8765 4321', activo: true, creado_en: new Date().toISOString() },
  { id: 3, nombre: 'Empresa ClimaCool SpA', email: 'contacto@climacool.cl', telefono: '+56 2 2999 8888', activo: true, creado_en: new Date().toISOString() }
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
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear usuario');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const newId = localUsuarios.length > 0 ? Math.max(...localUsuarios.map(u => u.id)) + 1 : 1;
    const created = { id: newId, ...data, activo: data.activo ?? true, creado_en: new Date().toISOString() };
    localUsuarios.push(created);
    return created;
  }
}

export async function updateUsuario(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    const json = await res.json();
    return json.data;
  } catch (err) {
    const index = localUsuarios.findIndex(u => u.id === Number(id));
    if (index !== -1) {
      localUsuarios[index] = { ...localUsuarios[index], ...data };
      return localUsuarios[index];
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
