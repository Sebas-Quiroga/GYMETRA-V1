import {
  signIn,
  signOut as amplifySignOut,
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';
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
export async function logout() {
  try {
    await amplifySignOut();
    window.location.href = "/login";
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    window.location.href = "/login";
  }
}
export async function getToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (err) {
    return undefined;
  }
}
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    return !!idToken;
  } catch (err) {
    return false;
  }
}
