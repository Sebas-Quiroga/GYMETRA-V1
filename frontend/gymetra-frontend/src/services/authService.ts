// src/services/authService.ts
import axios from "axios";
import { AUTH_API_URL } from "../services/apiService"; // ✅ usamos la constante global

// ===============================
// Decodificar JWT
// ===============================
export function decodeJWT(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (err: any) {
    console.error("❌ Error al decodificar token:", err.message);
    return null;
  }
}

// ===============================
// Iniciar sesión
// ===============================
export async function login(email: string, password: string) {
  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, { email, password });

    if (!response.data.token) {
      throw new Error("No se recibió token del servidor");
    }

    const token = response.data.token;
    localStorage.setItem("jwt", token);

    // ✅ decodificamos si quieres usar datos del usuario en /home
    const decoded = decodeJWT(token);
    console.log("Usuario autenticado:", decoded);

    // 🔹 Redirigimos siempre al HomePage
    window.location.href = "/home";

    return response.data;
  } catch (err: any) {
    throw err.response?.data || { message: "Error en login" };
  }
}

// ===============================
// Cerrar sesión
// ===============================
export function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "/login"; // redirige al login
}

// ===============================
// Obtener token actual
// ===============================
export function getToken(): string | null {
  return localStorage.getItem("jwt");
}

// ===============================
// Verificar si el usuario está autenticado
// ===============================
export function isAuthenticated(): boolean {
  return !!getToken();
}
