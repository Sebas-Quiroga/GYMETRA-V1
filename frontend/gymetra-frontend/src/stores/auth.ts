import { defineStore } from "pinia";
import { decodeJWT } from "@/services/authService";

interface UserData {
  userId?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  photoUrl?: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
    user: null as UserData | null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("jwt", token); // Sincroniza también en localStorage
      
      // Decodificar y guardar información del usuario
      const decoded = decodeJWT(token);
      if (decoded) {
        this.user = {
          userId: decoded.userId,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          phone: decoded.phone,
          status: decoded.status,
          photoUrl: decoded.photoUrl,
        };
      }
    },
    clearToken() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("jwt");
    },
    getTokenBase64(): string {
      return btoa(this.token);
    },
    initializeToken() {
      const stored = localStorage.getItem("jwt");
      if (stored) {
        this.token = stored;
        // También decodificar y cargar la información del usuario
        const decoded = decodeJWT(stored);
        if (decoded) {
          this.user = {
            userId: decoded.userId,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            phone: decoded.phone,
            status: decoded.status,
            photoUrl: decoded.photoUrl,
          };
        }
      }
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

