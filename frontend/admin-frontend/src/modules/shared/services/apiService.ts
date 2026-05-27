import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Standardized URLs using environment variables and Vite proxies for development.
 */
export const LOGIN_API_URL = import.meta.env.VITE_API_URL_LOGIN || "/api";
export const MEMBERSHIP_API_URL = import.meta.env.VITE_API_URL_MEMBERSHIP || "/membership-api";
export const QR_API_URL = import.meta.env.VITE_API_URL_QR || "/qr-api";

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
    // Session not found
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
      // Evitar bucles infinitos si ya estamos en login
      if (!window.location.pathname.includes('/loginadmin')) {
        window.location.href = '/loginadmin';
      }
    }
    return Promise.reject(error);
  }
);
