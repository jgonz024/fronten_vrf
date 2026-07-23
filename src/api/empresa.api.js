const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/empresa`;

export async function fetchEmpresa() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al consultar datos de la empresa');
  const json = await res.json();
  return json.data;
}

export async function saveEmpresa(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Error al guardar datos de la empresa');
  }
  const json = await res.json();
  return json.data;
}
