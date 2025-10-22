import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("jwt", token); // Sincroniza también en localStorage
    },
    clearToken() {
      this.token = "";
      localStorage.removeItem("jwt");
    },
    getTokenBase64(): string {
      return btoa(this.token);
    },
    initializeToken() {
      const stored = localStorage.getItem("jwt");
      if (stored) {
        this.token = stored;
      }
    },
  },
});

