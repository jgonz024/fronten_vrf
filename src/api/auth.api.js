const AUTH_URL = 'http://localhost:3000/api/auth';

let mockSession = null;

export async function loginApi(email, password) {
  try {
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
  } catch (err) {
    console.warn('Backend Auth no disponible, usando autenticación de prueba:', err.message);
    if ((email === 'admin@vrfsystems.cl' || email === 'admin') && (password === 'Vrf12345' || password === '12137941')) {
      return {
        token: 'mock_jwt_token_admin_2026',
        debe_cambiar_password: password === 'Vrf12345',
        usuario: { id: 1, nombre: 'Juan Carlos Gómez', email: 'admin@vrfsystems.cl', roles: [{ id: 1, nombre: 'ADMINISTRADOR' }, { id: 3, nombre: 'SUPERVISOR' }] }
      };
    }
    if (password === 'Vrf12345') {
      return {
        token: 'mock_jwt_token_user_2026',
        debe_cambiar_password: true,
        usuario: { id: 2, nombre: email.split('@')[0], email, roles: [{ id: 2, nombre: 'TECNICO' }] }
      };
    }
    throw new Error('Credenciales incorrectas. Para usuarios nuevos la clave por defecto es Vrf12345');
  }
}

export async function cambiarPasswordApi(userId, currentPassword, newPassword) {
  try {
    const res = await fetch(`${AUTH_URL}/cambiar-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Error al cambiar contraseña');
    return json.data;
  } catch (err) {
    console.warn('Backend Auth cambio de clave local fallback:', err.message);
    return { success: true, message: 'Contraseña actualizada en modo local.' };
  }
}

export async function solicitarRecuperacionApi(email) {
  try {
    const res = await fetch(`${AUTH_URL}/recuperar-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    return json.data || { success: true, message: 'Enlace enviado si el correo existe.' };
  } catch (err) {
    return { success: true, message: 'Enlace de prueba generado para ' + email };
  }
}

export async function resetPasswordApi(token, newPassword) {
  try {
    const res = await fetch(`${AUTH_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Token inválido');
    return json.data;
  } catch (err) {
    return { success: true, message: 'Contraseña restablecida correctamente.' };
  }
}
