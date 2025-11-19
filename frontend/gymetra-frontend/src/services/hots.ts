// src/services/hots.ts

/**
 * URLs de los túneles públicos de VS Code Dev Tunnels
 * Configura estas URLs según tus túneles activos
 */
const DEV_TUNNELS_CONFIG = {
  // Base del túnel (cambia esto por tu ID de túnel)
  TUNNEL_ID: '91fp6nxp', // ⚠️ CAMBIAR ESTO POR TU ID DE TÚNEL
  
  // URLs base para cada servicio
  BACKEND_AUTH: '91fp6nxp-8080',    // Backend de autenticación
  BACKEND_MEMBERSHIP: '91fp6nxp-8081', // Backend de membresías
  BACKEND_QR: '91fp6nxp-8082',      // Backend de QR
  FRONTEND: '91fp6nxp-8100',        // Frontend (no usado en Android)
  ADMIN: '91fp6nxp-8101'            // Admin (no usado en Android)
};

/**
 * Obtiene la URL del túnel para un puerto específico
 */
function getTunnelUrl(tunnelId: string): string {
  return `https://${tunnelId}.use.devtunnels.ms`;
}

/**
 * Detecta si estamos ejecutando en Capacitor (Android/iOS)
 */
function isCapacitor(): boolean {
  // Verificar si Capacitor está disponible en window
  if (typeof window !== 'undefined') {
    // Método 1: Verificar objeto Capacitor
    if ((window as any).Capacitor) {
      return true;
    }
    
    // Método 2: Verificar protocolo (Capacitor usa https:// o capacitor://)
    const protocol = window.location.protocol;
    if (protocol === 'capacitor:' || (protocol === 'https:' && window.location.hostname === 'localhost')) {
      return true;
    }
    
    // Método 3: Verificar user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent) || /iPhone|iPad|iPod/i.test(userAgent)) {
      // Si estamos en móvil y el protocolo es https con localhost, probablemente es Capacitor
      if (protocol === 'https:' && window.location.hostname === 'localhost') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Obtiene la URL base para Android usando túneles públicos
 * Prioriza usar túneles de VS Code Dev Tunnels si están configurados
 */
function getAndroidBaseUrl(): string {
  // 1. Verificar si hay configuración de túnel en variable de entorno
  const tunnelId = import.meta.env.VITE_TUNNEL_ID || import.meta.env.VITE_DEV_TUNNEL_ID;
  if (tunnelId) {
    const tunnelUrl = getTunnelUrl(tunnelId);
    console.log('✅ Usando túnel de variable de entorno:', tunnelUrl);
    return tunnelUrl;
  }

  // 2. Verificar si hay configuración de túnel en localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedTunnelId = localStorage.getItem('dev_tunnel_id');
      if (storedTunnelId) {
        const tunnelUrl = getTunnelUrl(storedTunnelId);
        console.log('✅ Usando túnel de localStorage:', tunnelUrl);
        return tunnelUrl;
      }
    } catch (e) {
      console.warn('No se pudo acceder a localStorage:', e);
    }
  }

  // 3. Usar configuración por defecto de DEV_TUNNELS_CONFIG
  // NOTA: Cambia DEV_TUNNELS_CONFIG.TUNNEL_ID con tu ID de túnel
  const defaultTunnelUrl = getTunnelUrl(DEV_TUNNELS_CONFIG.TUNNEL_ID);
  console.log('📱 Usando túnel por defecto:', defaultTunnelUrl);
  console.log('💡 Para cambiar el túnel, edita DEV_TUNNELS_CONFIG.TUNNEL_ID en hots.ts');
  
  return defaultTunnelUrl;
}

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

  // Detectar si estamos en Capacitor (Android/iOS)
  if (isCapacitor()) {
    // En Android, usar túneles públicos de VS Code Dev Tunnels
    const tunnelUrl = getAndroidBaseUrl();
    console.log('📱 Detectado Capacitor/Android, usando túnel público:', tunnelUrl);
    return tunnelUrl;
  }

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

  // Por defecto, usar localhost (para desarrollo web)
  return 'http://localhost';
}

export const HOST_URL = getBaseUrl();

/**
 * Obtiene la URL del backend basándose en el entorno
 * Si estamos en un túnel público, construye la URL del túnel del backend
 */
export function getBackendUrl(port: number = 8080): string {
  const baseUrl = getBaseUrl();
  
  // Si estamos en Capacitor/Android, usar la configuración de túneles
  if (isCapacitor()) {
    // Mapear puertos a IDs de túnel específicos
    let tunnelId: string;
    switch (port) {
      case 8080:
        tunnelId = DEV_TUNNELS_CONFIG.BACKEND_AUTH;
        break;
      case 8081:
        tunnelId = DEV_TUNNELS_CONFIG.BACKEND_MEMBERSHIP;
        break;
      case 8082:
        tunnelId = DEV_TUNNELS_CONFIG.BACKEND_QR;
        break;
      default:
        // Para otros puertos, construir basado en el túnel base
        const baseTunnelId = import.meta.env.VITE_TUNNEL_ID || DEV_TUNNELS_CONFIG.TUNNEL_ID;
        tunnelId = `${baseTunnelId}-${port}`;
    }
    return getTunnelUrl(tunnelId);
  }
  
  // Si estamos en un túnel público (desde navegador), construir la URL del túnel del backend
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
