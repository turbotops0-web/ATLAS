/**
 * Servicio de Seguridad Atlas
 * Maneja hashing de credenciales y persistencia de sesión
 */

// Hashes pre-calculados (SHA-256)
// Usuario: FELIPE -> Hash: 12470196886e08c0276d494874e0d9959600e19036a437142718e27c19c5c2a1
// Clave: WISIN540 -> Hash: 00b0d39e80e1598f4857878368886369c0d9a690e099684167e9f899e1a38407
const AUTHORIZED_USER_HASH = "12470196886e08c0276d494874e0d9959600e19036a437142718e27c19c5c2a1";
const AUTHORIZED_PASS_HASH = "00b0d39e80e1598f4857878368886369c0d9a690e099684167e9f899e1a38407";

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str.toUpperCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  /**
   * Valida credenciales usando hashing asíncrono
   */
  async validateCredentials(user: string, pass: string): Promise<boolean> {
    const userHash = await hashString(user);
    const passHash = await hashString(pass);

    const isValid = userHash === AUTHORIZED_USER_HASH && passHash === AUTHORIZED_PASS_HASH;
    
    if (isValid) {
      sessionStorage.setItem('atlas_session_token', btoa(`session_${Date.now()}`));
    }
    
    return isValid;
  },

  /**
   * Verifica si hay una sesión activa en la pestaña actual
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('atlas_session_token');
  },

  /**
   * Cierra la sesión
   */
  logout(): void {
    sessionStorage.removeItem('atlas_session_token');
  }
};