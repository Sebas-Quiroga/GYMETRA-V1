/**
 * Detecta automáticamente si estamos en un túnel público y construye la URL del backend
 */
function getBackendUrl(): string {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Detectar si estamos en un túnel público de VS Code (dev tunnels)
  if (hostname.includes('devtunnels.ms')) {
    // Estamos en un túnel público, construir la URL del túnel del backend
    // El formato es: https://xxxx-{port}.use.devtunnels.ms
    const parts = hostname.split('-');
    if (parts.length >= 2) {
      // Reemplazar el puerto en el hostname para el backend (8080)
      const newHostname = hostname.replace(/-\d+\.use\.devtunnels\.ms$/, '-8080.use.devtunnels.ms');
      return `${protocol}//${newHostname}/api`;
    }
  } else if (hostname.includes('vscode-cdn.net')) {
    // Para vscode-cdn.net, mantener el mismo dominio y usar el puerto 8080
    return `${protocol}//${hostname.split(':')[0]}:8080/api`;
  }

  // Si hay una variable de entorno configurada, usarla
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Por defecto, usar localhost
  return 'http://localhost:8080/api';
}

export const MAIN_API_URL = getBackendUrl();
