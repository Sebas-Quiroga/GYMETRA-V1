// src/services/authService.ts
import { 
  signIn, 
  signOut as amplifySignOut, 
  fetchAuthSession, 
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';

/**
 * Inicia sesión usando AWS Cognito a través de Amplify.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña plana.
 * @returns Un objeto con el token y los datos del usuario.
 */
export async function login(email: string, password: string) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password: password
    });

    if (isSignedIn) {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const userAttributes = await fetchUserAttributes();
      
      // Mapear atributos de Cognito al formato esperado por el frontend
      const userData = {
        email: userAttributes.email,
        firstName: userAttributes.given_name || '',
        lastName: userAttributes.family_name || '',
        sub: userAttributes.sub
      };

      console.log('✅ Login exitoso con Cognito:', userData);
      return { token: idToken, decoded: userData };
    } else {
      throw new Error(`Paso adicional requerido: ${nextStep.signInStep}`);
    }
  } catch (err: any) {
    if (err.name === 'UserAlreadyAuthenticatedException') {
      console.log('ℹ️ El usuario ya está autenticado. Recuperando sesión actual...');
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const userAttributes = await fetchUserAttributes();
      
      const userData = {
        email: userAttributes.email,
        firstName: userAttributes.given_name || '',
        lastName: userAttributes.family_name || '',
        sub: userAttributes.sub
      };
      return { token: idToken, decoded: userData };
    }
    console.error('❌ Error en login Cognito:', err);
    throw err;
  }
}

/**
 * Cierra la sesión en Amplify y redirige al login.
 */
export async function logout() {
  try {
    await amplifySignOut();
    window.location.href = "/login";
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    window.location.href = "/login";
  }
}

/**
 * Obtiene el ID Token actual de la sesión de Cognito.
 * Cognito maneja la renovación automática de tokens.
 */
export async function getToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (err) {
    return undefined;
  }
}

/**
 * Verifica si hay una sesión activa en Cognito.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    
    // Opcional: validar expiración (Amplify suele manejar esto)
    return !!idToken;
  } catch (err) {
    return false;
  }
}

/**
 * Función legacy para decodificar JWT si es necesario,
 * aunque con Amplify v6 es mejor usar fetchUserAttributes().
 */
export function decodeJWT(token: any) {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1];
    const decodedStr = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedStr);
  } catch (err: any) {
    console.error("❌ Error al decodificar token:", err.message);
    return null;
  }
}
