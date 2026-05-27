import {
  signIn, signOut, fetchAuthSession, getCurrentUser,
  fetchUserAttributes, signUp, confirmSignUp, resendSignUpCode,
  resetPassword as amplifyResetPassword, confirmResetPassword
} from 'aws-amplify/auth';

export const authService = {
  // --- SESIÓN ---
  async login(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (!isSignedIn) throw new Error(`Paso adicional requerido: ${nextStep.signInStep}`);

      return await this.getCurrentSessionData();
    } catch (err: any) {
      if (err.name === 'UserAlreadyAuthenticatedException') {
        return await this.getCurrentSessionData();
      }
      throw err;
    }
  },

  async logout() {
    await signOut();
  },

  async getCurrentSessionData() {
    const session = await fetchAuthSession();
    const attributes = await fetchUserAttributes();
    return {
      token: session.tokens?.idToken?.toString(),
      user: {
        email: attributes.email,
        firstName: attributes.given_name || '',
        lastName: attributes.family_name || '',
        sub: attributes.sub
      }
    };
  },

  async checkAuth(): Promise<boolean> {
    try {
      await getCurrentUser();
      const session = await fetchAuthSession();
      return !!session.tokens?.idToken;
    } catch {
      return false;
    }
  },

  // --- REGISTRO ---
  async register(data: any) {
    let formattedPhone = data.phone.trim();
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = `+57${formattedPhone}`;
    }

    return await signUp({
      username: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        userAttributes: {
          email: data.email.toLowerCase().trim(),
          given_name: data.firstName.trim(),
          family_name: data.lastName.trim(),
          phone_number: formattedPhone,
          preferred_username: data.identification.trim()
        }
      }
    });
  },

  async confirmRegister(username: string, code: string) {
    return await confirmSignUp({
      username: username.toLowerCase().trim(),
      confirmationCode: code.trim()
    });
  },

  async resendCode(username: string) {
    return await resendSignUpCode({ username: username.toLowerCase().trim() });
  },

  // --- RECUPERACIÓN ---
  async sendRecoveryCode(email: string) {
    const { nextStep } = await amplifyResetPassword({ username: email });
    return nextStep.resetPasswordStep;
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    return await confirmResetPassword({
      username: email,
      confirmationCode: token,
      newPassword
    });
  }
};