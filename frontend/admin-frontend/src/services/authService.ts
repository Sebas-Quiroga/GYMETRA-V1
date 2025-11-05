// src/services/authService.ts
import axios from "axios";
import { MAIN_API_URL } from "./apiService";

// ===============================
// 🔍 Decodificar token JWT
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
// 🔐 Iniciar sesión de administrador
// ===============================
export async function login(email: string, password: string) {
  try {
    const response = await axios.post(`${MAIN_API_URL}/auth/login`, { email, password });

    let token = response.data?.token;
    if (!token) throw new Error("No se recibió token del servidor");

    const decoded = decodeJWT(token);

    // 🔧 Remover photoUrl del payload si existe para evitar headers demasiado grandes (error 431)
    if (decoded && decoded.photoUrl) {
      delete decoded.photoUrl;
      // Re-encode el token sin la photoUrl (nota: esto invalida la firma, pero asumiendo que el backend no la verifica en dev)
      const parts = token.split('.');
      const header = parts[0];
      const newPayload = btoa(JSON.stringify(decoded)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      token = `${header}.${newPayload}.${parts[2]}`;
    }

    // ✅ Verificar rol de administrador
    // Aceptar tanto roles por nombre como por IDs (ej. roleIds: [1] o roleIds: 1 -> administrador)
    // Normalizar distintos formatos posibles en el payload
    const roleName = decoded?.role || decoded?.roleName || decoded?.roles?.[0]?.roleName;

    const normalizeRoleIds = (d: any): number[] => {
      if (!d) return []
      const out: number[] = []

      // roleIds puede venir como array, número o string
      if (Array.isArray(d.roleIds)) {
        d.roleIds.forEach((r: any) => {
          if (r != null) out.push(Number(r))
        })
      } else if (d.roleIds != null) {
        out.push(Number(d.roleIds))
      }

      // roles puede ser un array de objetos { roleId } o un array de ids
      if (Array.isArray(d.roles)) {
        d.roles.forEach((r: any) => {
          if (r == null) return
          if (typeof r === 'object' && (r.roleId != null || r.role?.roleId != null)) {
            // distintos backends pueden anidar roleId
            out.push(Number(r.roleId ?? r.role?.roleId))
          } else if (typeof r === 'number' || typeof r === 'string') {
            out.push(Number(r))
          }
        })
      }

      return out.filter((n) => !Number.isNaN(n))
    }

    const roleIds = normalizeRoleIds(decoded)

    const isAdminByName = roleName === 'Admin' || roleName === 'SuperAdmin'
    const isAdminById = Array.isArray(roleIds) && roleIds.some((id) => Number(id) === 1)

    if (!isAdminByName && !isAdminById) {
      throw new Error('Acceso denegado: este usuario no tiene permisos de administrador')
    }

    // Guardar token (sin photoUrl para evitar headers grandes)
    localStorage.setItem("admin_jwt", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { token };
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Error al iniciar sesión como administrador";
    throw new Error(message);
  }
}

// ===============================
// 🚪 Cerrar sesión
// ===============================
export function logout() {
  localStorage.removeItem("admin_jwt");
  delete axios.defaults.headers.common["Authorization"];
  // Redirigir al login de administrador
  window.location.href = "/loginadmin";
}

// ===============================
// ✅ Verificar autenticación
// ===============================
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("admin_jwt");
  if (!token) return false;

  const decoded = decodeJWT(token);
  if (!decoded) return false;

  // Verificar rol por nombre o por IDs (1 es considerado administrador)
  // Verificar por roleName (p.ej. 'Admin') o por roleIds (1 es administrador)
  const roleName = decoded?.role || decoded?.roleName || decoded?.roles?.[0]?.roleName;

  const normalizeRoleIds = (d: any): number[] => {
    if (!d) return []
    const out: number[] = []

    if (Array.isArray(d.roleIds)) {
      d.roleIds.forEach((r: any) => { if (r != null) out.push(Number(r)) })
    } else if (d.roleIds != null) {
      out.push(Number(d.roleIds))
    }

    if (Array.isArray(d.roles)) {
      d.roles.forEach((r: any) => {
        if (r == null) return
        if (typeof r === 'object' && (r.roleId != null || r.role?.roleId != null)) {
          out.push(Number(r.roleId ?? r.role?.roleId))
        } else if (typeof r === 'number' || typeof r === 'string') {
          out.push(Number(r))
        }
      })
    }

    return out.filter((n) => !Number.isNaN(n))
  }

  const roleIds = normalizeRoleIds(decoded)

  const isAdminByName = roleName === 'Admin' || roleName === 'SuperAdmin'
  const isAdminById = Array.isArray(roleIds) && roleIds.some((id) => Number(id) === 1)
  if (!isAdminByName && !isAdminById) return false;

  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    logout();
    return false;
  }

  return true;
}
