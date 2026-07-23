const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/categoria-activo`;

export async function fetchCategoriasActivo(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de categorías de activos');
  const json = await res.json();
  return json.data;
}

export async function fetchCategoriaActivoById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener categoría de activo');
  const json = await res.json();
  return json.data;
}

export async function createCategoriaActivo(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear categoría de activo');
  }
  const json = await res.json();
  return json.data;
}

export async function updateCategoriaActivo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar categoría de activo');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCategoriaActivo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar categoría de activo');
  return await res.json();
}

export async function restoreCategoriaActivo(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar categoría de activo');
  const json = await res.json();
  return json.data;
}
