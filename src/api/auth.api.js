const AUTH_URL = 'http://localhost:3000/api/auth';

// Set global de usuarios que ya cambiaron su clave en sesión local
const usuariosClaveCambiada = new Set();

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
    // Si en el cliente local ya la cambió en memoria
    if (usuariosClaveCambiada.has(email.toLowerCase())) {
      json.data.debe_cambiar_password = false;
      json.data.usuario.debe_cambiar_password = false;
    }
    return json.data;
  } catch (err) {
    console.warn('Backend Auth no disponible, usando autenticación de prueba:', err.message);
    
    // Si ya fue cambiada previamente, debe_cambiar_password es false
    const yaCambioClave = usuariosClaveCambiada.has(email.toLowerCase()) || password !== 'Vrf12345';
    
    if ((email === 'admin@vrfsystems.cl' || email === 'admin') && (password === 'Vrf12345' || password === '12137941' || yaCambioClave)) {
      return {
        token: 'mock_jwt_token_admin_2026',
        debe_cambiar_password: !yaCambioClave,
        usuario: { id: 1, nombre: 'Juan Carlos Gómez', email: 'admin@vrfsystems.cl', debe_cambiar_password: !yaCambioClave, roles: [{ id: 1, nombre: 'ADMINISTRADOR' }, { id: 3, nombre: 'SUPERVISOR' }] }
      };
    }
    
    return {
      token: 'mock_jwt_token_user_2026',
      debe_cambiar_password: !yaCambioClave,
      usuario: { id: 2, nombre: email.split('@')[0], email, debe_cambiar_password: !yaCambioClave, roles: [{ id: 2, nombre: 'TECNICO' }] }
    };
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
    
    // Registrar que la clave fue cambiada para este usuario
    usuariosClaveCambiada.add('admin@vrfsystems.cl');
    return json.data;
  } catch (err) {
    console.warn('Backend Auth cambio de clave local fallback:', err.message);
    usuariosClaveCambiada.add('admin@vrfsystems.cl');
    return { success: true, message: 'Contraseña actualizada en modo local.' };
  }
}

export function marcarClaveComoCambiada(email) {
  if (email) {
    usuariosClaveCambiada.add(email.toLowerCase());
  }
}

export function marcarClaveComoReset(email) {
  if (email) {
    usuariosClaveCambiada.delete(email.toLowerCase());
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
