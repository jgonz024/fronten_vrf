const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/dosier-informe-tecnico`;

export async function fetchDosieres(includeDeleted = false, idCliente = null) {
  const params = new URLSearchParams();
  if (includeDeleted) params.set('includeDeleted', 'true');
  if (idCliente) params.set('idCliente', String(idCliente));

  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener informes técnicos / dosieres');
  }
  const json = await res.json();
  return json.data || [];
}

export async function fetchDosierById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener el informe técnico');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchOtsDisponibles(idCliente) {
  const res = await fetch(`${API_URL}/ots-disponibles?idCliente=${idCliente}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al consultar órdenes de trabajo disponibles para el cliente');
  }
  const json = await res.json();
  return json.data || [];
}

export async function createDosier(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear informe técnico');
  }
  const json = await res.json();
  return json.data;
}

export async function updateDosier(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar informe técnico');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteDosier(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar informe técnico');
  }
  const json = await res.json();
  return json.data;
}

export async function restoreDosier(id) {
  const res = await fetch(`${API_URL}/${id}/restaurar`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al restaurar informe técnico');
  }
  const json = await res.json();
  return json.data;
}

export async function enviarDosierEmail(id, emailData) {
  const res = await fetch(`${API_URL}/${id}/enviar-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al enviar informe por correo electrónico');
  }
  const json = await res.json();
  return json;
}
