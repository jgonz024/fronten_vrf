const API_BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = `${API_BASE_URL}/auth`;

export async function loginApi(email, password) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Error al iniciar sesión');
  }
  return json.data;
}

export async function cambiarPasswordApi(userId, currentPassword, newPassword) {
  const res = await fetch(`${AUTH_URL}/cambiar-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword, newPassword })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Error al cambiar contraseña');
  }
  return json.data;
}

export async function solicitarRecuperacionApi(email) {
  const res = await fetch(`${AUTH_URL}/recuperar-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Error al solicitar recuperación');
  }
  return json.data;
}

export async function resetPasswordApi(token, newPassword) {
  const res = await fetch(`${AUTH_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Token inválido o expirado');
  }
  return json.data;
}
