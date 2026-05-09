import { fetchAuthSession } from 'aws-amplify/auth';
export const AUTH_API_URL = import.meta.env.VITE_API_URL_LOGIN || "http://localhost:8080/api";
export const MEMBERSHIP_API_URL = import.meta.env.VITE_API_URL_MEMBERSHIP || "http://localhost:8081/api";
export const QR_API_URL = import.meta.env.VITE_API_URL_QR || "http://localhost:8090/api";
export const MAIN_API_URL = AUTH_API_URL;
export const API_ENDPOINTS = {
  AUTH: {
    USERS: `${MAIN_API_URL}/auth/users`,
    ME: `${MAIN_API_URL}/me`,
  }
};
export const API_CONFIG = {
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string };
}
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const contentType = response.headers.get('content-type');
    let responseData: any;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = {
        success: response.ok,
        message: response.ok ? 'Operación exitosa' : `Error ${response.status}`
      };
    }
    if (response.ok) {
      return {
        success: true,
        message: responseData.message || 'OK',
        data: responseData.data || responseData
      };
    } else {
      return {
        success: false,
        message: responseData.message || responseData.error || `Error ${response.status}`,
        errors: responseData.errors
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Tiempo de espera agotado');
    throw err;
  }
};
export const apiAuthRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> => {
  let authToken = token;
  if (!authToken) {
    try {
      const session = await fetchAuthSession();
      authToken = session.tokens?.idToken?.toString();
    } catch (err) {
      console.warn('⚠️ No se pudo obtener sesión de Cognito para la petición');
    }
  }
  const headers: Record<string, string> = { ...((options.headers as any) || {}) };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return apiRequest<T>(url, {
    ...options,
    headers
  });
};
export const apiGet = (url: string, headers?: any) => apiRequest(url, { method: 'GET', headers });
export const apiPost = (url: string, data: any, headers?: any) =>
  apiRequest(url, { method: 'POST', body: JSON.stringify(data), headers });

