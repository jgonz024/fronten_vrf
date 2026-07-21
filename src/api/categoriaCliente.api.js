const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/categoria-cliente`;

export async function fetchCategoriasCliente() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al conectar con la API de categorías de cliente');
  const json = await res.json();
  return json.data;
}

export async function fetchCategoriaClienteById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener categoría de cliente');
  const json = await res.json();
  return json.data;
}

export async function createCategoriaCliente(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al crear categoría de cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function updateCategoriaCliente(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al actualizar categoría de cliente');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCategoriaCliente(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar categoría de cliente');
  return await res.json();
}
