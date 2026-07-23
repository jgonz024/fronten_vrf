const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/marca-activo`;

export async function fetchMarcasActivo(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de marcas de activos');
  const json = await res.json();
  return json.data;
}

export async function fetchMarcaActivoById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener marca de activo');
  const json = await res.json();
  return json.data;
}

export async function createMarcaActivo(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear marca de activo');
  }
  const json = await res.json();
  return json.data;
}

export async function updateMarcaActivo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar marca de activo');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteMarcaActivo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar marca de activo');
  return await res.json();
}

export async function restoreMarcaActivo(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar marca de activo');
  const json = await res.json();
  return json.data;
}
