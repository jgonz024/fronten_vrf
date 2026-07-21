const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/direcciones`;

export async function fetchDirecciones(clienteId = null, includeDeleted = false) {
  let url = API_URL;
  const params = [];

  if (clienteId) params.push(`id_cliente=${clienteId}`);
  if (includeDeleted) params.push(`includeDeleted=true`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de direcciones');
  const json = await res.json();
  return json.data;
}

export async function fetchDireccionById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener dirección');
  const json = await res.json();
  return json.data;
}

export async function createDireccion(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear dirección');
  }
  const json = await res.json();
  return json.data;
}

export async function updateDireccion(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar dirección');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteDireccion(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar dirección');
  return await res.json();
}

export async function restoreDireccion(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar dirección');
  const json = await res.json();
  return json.data;
}
