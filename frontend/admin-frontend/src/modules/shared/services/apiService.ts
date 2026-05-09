import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Standardized URLs using Vite proxies defined in vite.config.ts
 */
export const LOGIN_API_URL = "/api";
export const MEMBERSHIP_API_URL = "/membership-api";
export const QR_API_URL = "/qr-api";

// Compatibility with existing code
export const MAIN_API_URL = LOGIN_API_URL;

// Configurar interceptor para inyectar token de Cognito automáticamente
axios.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('⚠️ No se pudo obtener sesión activa de Cognito para la petición API');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Manejar errores globales (ej: 401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Sesión expirada o inválida. Redirigiendo...');
      // Evitar bucles infinitos si ya estamos en login
      if (!window.location.pathname.includes('/loginadmin')) {
        window.location.href = '/loginadmin';
      }
    }
    return Promise.reject(error);
  }
);
