// src/services/authService.ts
import axios from "axios";
import { MAIN_API_URL } from "../services/apiService";

// ===============================
// Decodificar JWT
// ===============================
export function decodeJWT(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedStr = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedStr);
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
    const response = await axios.post(`${ MAIN_API_URL}/login`, { email, password });

    if (!response.data.token) {
      throw new Error("No se recibió token del servidor");
    }

    const token = response.data.token;

    // Guardar token en localStorage
    localStorage.setItem("jwt", token);

    // Decodificar token para obtener información del usuario
    const decoded = decodeJWT(token);

    // Mostrar usuario autenticado en consola (opcional)
    console.log("Usuario autenticado:", decoded);

    // Devolver token y usuario decodificado
    return { token, decoded };
  } catch (err: any) {
    // Lanzar error con mensaje específico si existe
    throw err.response?.data || { message: "Error en login" };
  }
}

// ===============================
// Cerrar sesión
// ===============================
export function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "/login"; // Redirige al login
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
  const token = getToken();
  if (!token) return false;

  // Intentar decodificar el token para validar que sea correcto
  const decoded = decodeJWT(token);
  if (!decoded) return false;

  // Opcional: validar fecha de expiración
  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    // Token expirado
    localStorage.removeItem("jwt");
    return false;
  }

  return true;
}
