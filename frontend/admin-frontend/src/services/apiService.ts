import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// Base URL configurada para apuntar al backend a través del proxy de Vite
export const MAIN_API_URL = "/api";

// Configurar interceptor para inyectar token de Cognito automáticamente
axios.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Si falla la obtención de la sesión, el backend devolverá 401 y el router manejará la redirección
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
        localStorage.removeItem('admin_jwt');
        window.location.href = '/loginadmin';
      }
    }
    return Promise.reject(error);
  }
);
