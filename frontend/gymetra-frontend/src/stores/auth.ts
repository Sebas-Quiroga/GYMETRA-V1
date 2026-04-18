import { defineStore } from "pinia";
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import axios from "axios";
import { HOST_URL } from "@/services/hots";

const ME_URL = `${HOST_URL}:8080/api/me`;

interface UserData {
  userId?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  photoUrl?: string;
  cognitoSub?: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
    user: null as UserData | null,
    isInitialized: false,
  }),
  actions: {
    /**
     * Sincroniza el estado del store con la sesión actual de Cognito.
     * Si hay una sesión, también llama a /api/me para sincronizar el perfil local.
     */
    async initialize() {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (idToken) {
          this.token = idToken;
          await this.syncLocalProfile();
        } else {
          this.clearToken();
        }
      } catch (err) {
        this.clearToken();
      } finally {
        this.isInitialized = true;
      }
    },

    /**
     * Llama al backend (/api/me) para sincronizar el perfil de Cognito con la BD local.
     * El backend usa el ID Token para obtener el email y crear/actualizar el registro.
     */
    async syncLocalProfile() {
      if (!this.token) return;

      try {
        const response = await axios.get(ME_URL, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        // El backend retorna { sub, email, localProfile: { userId, firstName, ... }, cognitoClaims: { ... } }
        const data = response.data;
        if (data.localProfile) {
          this.user = {
            userId: data.localProfile.userId,
            email: data.email,
            firstName: data.localProfile.firstName,
            lastName: data.localProfile.lastName,
            phone: data.localProfile.phone,
            status: data.localProfile.status,
            photoUrl: data.localProfile.photoUrl,
            cognitoSub: data.sub
          };
        }
        console.log("✅ Perfil sincronizado con éxito:", this.user);
      } catch (err) {
        console.error("❌ Error al sincronizar perfil local:", err);
        // Aunque falle la sincronización local, mantenemos el token de Cognito para reintentar
      }
    },

    setToken(token: string) {
      this.token = token;
      this.syncLocalProfile(); // Sincroniza inmediatamente al recibir nuevo token
    },

    clearToken() {
      this.token = "";
      this.user = null;
    },

    updateUser(userData: Partial<UserData>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    updateUserPhoto(photoUrl: string) {
      if (this.user) {
        this.user.photoUrl = photoUrl;
      }
    },
    async logout() {
      try {
        const { signOut } = await import('aws-amplify/auth');
        await signOut();
      } catch (err) {
        console.error("❌ Error al cerrar sesión en Cognito:", err);
      } finally {
        this.clearToken();
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userInfo: (state) => state.user,
    userPhotoUrl: (state) => state.user?.photoUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    userName: (state) => {
      if (!state.user) return 'Usuario';
      const { firstName, lastName, email } = state.user;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      if (firstName) return firstName;
      if (email) return email.split('@')[0];
      return 'Usuario';
    },
  },
});
