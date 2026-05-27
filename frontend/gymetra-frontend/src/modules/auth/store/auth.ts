import { defineStore } from "pinia";
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import axios from "axios";
import { AUTH_API_URL } from "../../shared/services/apiService";
const ME_URL = `${AUTH_API_URL}/me`;
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
    async syncLocalProfile() {
      if (!this.token) return;
      try {
        const response = await axios.get(ME_URL, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
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
      } catch (err) {
        // Fallar silenciosamente
      }
    },
    setToken(token: string) {
      this.token = token;
      this.syncLocalProfile();
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
        await signOut({ global: true });
      } catch (err) {
        // Fallar silenciosamente
      } finally {
        this.clearToken();
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userInfo: (state) => state.user,
    userPhotoUrl: (state) => state.user?.photoUrl || 'https://www.gravatar.com/avatar/000?d=mp&f=y',
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

