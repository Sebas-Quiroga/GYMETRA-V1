// src/services/hots.ts

/**
 * Detecta automáticamente si estamos en un túnel público de VS Code (dev tunnels)
 * y construye las URLs base correctamente para funcionar tanto en localhost como en túneles públicos
 */
function getBaseUrl(): string {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') {
    return 'http://localhost';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Detectar si estamos en un túnel público de VS Code (dev tunnels)
  if (hostname.includes('devtunnels.ms') || hostname.includes('vscode-cdn.net')) {
    // Estamos en un túnel público, usar el mismo dominio base
    // El backend debería estar en un túnel similar, por ejemplo:
    // Frontend: https://xxxx-8100.use.devtunnels.ms
    // Backend:  https://xxxx-8080.use.devtunnels.ms
    // Usamos el mismo dominio base y cambiamos solo el puerto en las URLs específicas
    return `${protocol}//${hostname.split(':')[0]}`;
  }

  // Si hay una variable de entorno configurada, usarla (útil para override manual)
  const envHost = import.meta.env.VITE_API_HOST;
  if (envHost) {
    return envHost;
  }

  // Por defecto, usar localhost
  return 'http://localhost';
}

export const HOST_URL = getBaseUrl();

/**
 * Obtiene la URL del backend basándose en el entorno
 * Si estamos en un túnel público, construye la URL del túnel del backend
 */
export function getBackendUrl(port: number = 8080): string {
  const baseUrl = getBaseUrl();
  
  // Si estamos en un túnel público, necesitamos construir la URL del túnel del backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('devtunnels.ms')) {
      // Para dev tunnels, el formato es: https://xxxx-{port}.use.devtunnels.ms
      // Necesitamos reemplazar el puerto en el hostname
      const parts = hostname.split('-');
      if (parts.length >= 2) {
        // Reemplazar el puerto en el hostname
        const newHostname = hostname.replace(/-\d+\.use\.devtunnels\.ms$/, `-${port}.use.devtunnels.ms`);
        return `${window.location.protocol}//${newHostname}`;
      }
    } else if (hostname.includes('vscode-cdn.net')) {
      // Para vscode-cdn.net, mantener el mismo dominio y usar el puerto
      return `${window.location.protocol}//${hostname.split(':')[0]}:${port}`;
    }
  }
  
  // Para localhost o otros casos, usar el puerto directamente
  return `${baseUrl}:${port}`;
}
