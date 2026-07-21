const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/clientes`;

export async function fetchClientes(includeDeleted = false) {
  const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al conectar con la API de clientes');
  const json = await res.json();
  return json.data;
}

export async function fetchClienteById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener cliente');
  const json = await res.json();
  return json.data;
}

export async function createCliente(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function updateCliente(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCliente(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar cliente');
  return await res.json();
}

export async function restoreCliente(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al restaurar cliente');
  const json = await res.json();
  return json.data;
}
