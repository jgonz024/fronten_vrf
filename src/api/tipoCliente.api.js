const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/tipo-cliente`;

export async function fetchTiposCliente() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al conectar con la API de tipos de cliente');
  const json = await res.json();
  return json.data;
}

export async function fetchTipoClienteById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener tipo de cliente');
  const json = await res.json();
  return json.data;
}

export async function createTipoCliente(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear tipo de cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function updateTipoCliente(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar tipo de cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteTipoCliente(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar tipo de cliente');
  return await res.json();
}
