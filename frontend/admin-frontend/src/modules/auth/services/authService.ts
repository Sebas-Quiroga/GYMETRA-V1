import { 
  signIn, 
  signOut as amplifySignOut, 
  fetchAuthSession, 
  getCurrentUser 
} from 'aws-amplify/auth';
import axios from "axios";

/**
 * Inicia sesión de administrador usando AWS Cognito.
 * Valida que el usuario pertenezca al grupo 'Admin'.
 */
export async function login(email: string, password: string) {
  try {
    const { isSignedIn } = await signIn({
      username: email,
      password: password
    });

    if (isSignedIn) {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;
      const groups = accessToken?.payload['cognito:groups'] as string[] || [];

      // Validar si el usuario está en el grupo Admin
      if (!groups.includes('Admin')) {
        await amplifySignOut();
        throw new Error('Acceso denegado: este usuario no tiene permisos de administrador en Cognito');
      }

      const idToken = session.tokens?.idToken?.toString();
      axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

      return { token: idToken };
    } else {
      throw new Error('Se requiere un paso adicional de autenticación');
    }
  } catch (err: any) {
    if (err.name === 'UserAlreadyAuthenticatedException') {
      console.log('ℹ️ Admin ya autenticado. Recuperando sesión...');
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
      return { token: idToken };
    }
    console.error('❌ Error en login Admin:', err);
    throw err;
  }
}

/**
 * Cierra la sesión en Amplify.
 */
export async function logout() {
  try {
    await amplifySignOut();
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/loginadmin";
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    window.location.href = "/loginadmin";
  }
}

/**
 * Verifica si el usuario está autenticado y es Admin de forma asíncrona.
 */
export async function isAuthenticatedAsync(): Promise<boolean> {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
    return groups.includes('Admin');
  } catch (err) {
    return false;
  }
}

/**
 * Helper para obtener el token actual de forma asíncrona.
 */
export async function getAsyncToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch {
    return undefined;
  }
}
