import { getBackendUrl } from"../services/hots";

// Configuración base de la API - usa detección automática para túneles públicos
export const MAIN_API_URL = `${getBackendUrl(8080)}/api/auth`;

// Configuración para diferentes endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${MAIN_API_URL}/register`,
    LOGIN: `${MAIN_API_URL}/login`,
    LOGOUT: `${MAIN_API_URL}/logout`,
    REFRESH: `${MAIN_API_URL}/refresh`,
    VERIFY_EMAIL: `${MAIN_API_URL}/verify-email`,
  }
};

// Configuración general
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string };
}

// Función helper para hacer peticiones HTTP
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // Intentar parsear la respuesta JSON
    let responseData: ApiResponse<T>;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Si no es JSON, crear respuesta basada en status
      responseData = {
        success: response.ok,
        message: response.ok ? 'Operación exitosa' : `Error ${response.status}: ${response.statusText}`
      };
    }

    // Normalización: asegurar que siempre devolvemos ApiResponse<T>
    if (!('success' in responseData)) {
      responseData = {
        success: response.ok,
        message: (responseData as any)?.message || (response.ok ? 'Operación exitosa' : 'Error'),
        data: responseData as any
      };
    }

    if (!response.ok) {
      const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
      console.error('❌ API Error:', responseData);
      throw new Error(errorMessage);
    }

    console.log('✅ API Success:', responseData);
    return responseData;

  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('💥 API Request Failed:', err);

    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.');
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Error de conexión con el servidor. Verifica que el backend esté funcionando.');
    }

    throw err;
  }
};

// Función específica para peticiones POST
export const apiPost = async <T = any>(
  url: string,
  data: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers
  });
};

// Función específica para peticiones GET
export const apiGet = async <T = any>(
  url: string,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, {
    method: 'GET',
    headers
  });
};

// Función para manejar autenticación con token
export const apiAuthRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> => {
  const authHeaders: Record<string, string> = {};
  
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  return apiRequest<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders
    }
  });
};

// Helper para obtener token almacenado (si usas localStorage)
export const getStoredToken = (): string | null => {
  // Si no estás usando localStorage, puedes usar otra forma de almacenamiento
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

// Helper para guardar token (si usas localStorage)
export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.warn('No se pudo guardar el token:', error);
  }
};

// Helper para limpiar token
export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.warn('No se pudo limpiar el token:', error);
  }
};