// src/services/membershipService.ts
import { apiGet, apiPost, apiAuthRequest, ApiResponse } from './apiService';
import { getToken } from './authService';

// URL base para membresías
const MEMBERSHIP_API_URL = "http://localhost:8081/api";

// Endpoints específicos para membresías
export const MEMBERSHIP_ENDPOINTS = {
  AVAILABLE: `${MEMBERSHIP_API_URL}/memberships/available`,
  PURCHASE: `${MEMBERSHIP_API_URL}/purchase`, // Ruta corregida
  USER_MEMBERSHIPS: `${MEMBERSHIP_API_URL}/memberships/user`,
  HEALTH_CHECK: `${MEMBERSHIP_API_URL}/health`, // Endpoint para verificar conectividad
};

// Interfaces para las membresías
export interface Membership {
  membershipId: number;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  status: string;
  features?: string[];
  isPopular?: boolean;
}

export interface PurchaseRequest {
  membershipId: number;
  userId: number;
  paymentMethod?: string;
}

export interface UserMembership {
  membershipId: number;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  daysRemaining: number;
}

// ===============================
// Obtener membresías disponibles
// ===============================
export async function getAvailableMemberships(): Promise<Membership[]> {
  try {
    console.log('🔍 Cargando membresías disponibles...');
    
    const response = await apiGet<Membership[]>(MEMBERSHIP_ENDPOINTS.AVAILABLE);
    
    if (response.success && response.data) {
      console.log('✅ Membresías cargadas exitosamente desde API:', response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'No se pudieron cargar las membresías');
  } catch (error: any) {
    console.error('❌ Error al cargar membresías desde API:', error);
    
    // Si hay error de conexión, usar datos de fallback
    if (error.message.includes('conexión') || 
        error.message.includes('fetch') || 
        error.message.includes('Tiempo de espera') ||
        error.message.includes('CORS')) {
      
      console.log('🔄 Usando datos de fallback debido a error de conexión...');
      return getMockMemberships();
    }
    
    throw new Error(error.message || 'Error al cargar los planes disponibles');
  }
}

// ===============================
// Datos de fallback para membresías
// ===============================
function getMockMemberships(): Membership[] {
  console.log('🧪 Cargando membresías de prueba...');
  
  return [
    {
      membershipId: 1,
      planName: "Plan Básico",
      price: 29990,
      durationDays: 30,
      description: "Acceso completo al gimnasio durante 30 días",
      status: "available",
      features: [
        "Acceso a todas las máquinas",
        "Horario completo",
        "Vestuarios y duchas",
        "WiFi gratuito"
      ],
      isPopular: false
    },
    {
      membershipId: 2,
      planName: "Plan Premium",
      price: 49990,
      durationDays: 30,
      description: "Incluye clases grupales y asesoría nutricional",
      status: "available",
      features: [
        "Todo lo del plan básico",
        "Clases grupales ilimitadas",
        "Asesoría nutricional",
        "Área VIP",
        "Toallas incluidas"
      ],
      isPopular: true
    },
    {
      membershipId: 3,
      planName: "Plan Trimestral",
      price: 79990,
      durationDays: 90,
      description: "Ahorra con nuestro plan de 3 meses",
      status: "available",
      features: [
        "Todo lo del plan premium",
        "15% de descuento",
        "Evaluación física mensual",
        "Plan de entrenamiento personalizado"
      ],
      isPopular: false
    },
    {
      membershipId: 4,
      planName: "Plan Anual",
      price: 299990,
      durationDays: 365,
      description: "El mejor precio - Membresía completa por 1 año",
      status: "available",
      features: [
        "Todo incluido",
        "30% de descuento",
        "Entrenador personal (2h/mes)",
        "Acceso a todas las sucursales",
        "Invitados gratis (2/mes)"
      ],
      isPopular: false
    }
  ];
}

// ===============================
// Comprar una membresía
// ===============================
export async function purchaseMembership(purchaseData: PurchaseRequest): Promise<any> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    // Validar que userId esté presente
    if (!purchaseData.userId) {
      throw new Error('ID de usuario requerido para la compra');
    }

    console.log('💳 Procesando compra de membresía:', purchaseData);
    console.log('🔑 Token disponible:', !!token);
    
    const response = await apiAuthRequest(
      MEMBERSHIP_ENDPOINTS.PURCHASE,
      {
        method: 'POST',
        body: JSON.stringify(purchaseData)
      },
      token
    );
    
    if (response.success) {
      console.log('✅ Membresía comprada exitosamente:', response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'Error al procesar la compra');
  } catch (error: any) {
    console.error('❌ Error al comprar membresía:', error);
    
    // Manejar errores específicos de CORS
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      throw new Error('external_payment_required: Error de conexión, redirigir a pasarela');
    }
    
    throw new Error(error.message || 'Error al procesar la compra');
  }
}

// ===============================
// Obtener membresías del usuario
// ===============================
export async function getUserMemberships(): Promise<UserMembership[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    console.log('👤 Cargando membresías del usuario...');
    
    const response = await apiAuthRequest<UserMembership[]>(
      MEMBERSHIP_ENDPOINTS.USER_MEMBERSHIPS,
      { method: 'GET' },
      token
    );
    
    if (response.success && response.data) {
      console.log('✅ Membresías del usuario cargadas:', response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'No se pudieron cargar las membresías del usuario');
  } catch (error: any) {
    console.error('❌ Error al cargar membresías del usuario:', error);
    throw new Error(error.message || 'Error al cargar tus membresías');
  }
}

// ===============================
// Funciones de utilidad
// ===============================

// Formatear precio con separadores de miles
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Formatear duración en formato legible
export function formatDuration(days: number): string {
  if (days < 31) {
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.round(days / 365);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
}

// Obtener el ícono apropiado según la duración
export function getMembershipIcon(days: number): string {
  if (days <= 31) {
    // Ícono para planes mensuales
    return 'M12 2v20M9 5h6M9 19h6M5 8h14M5 16h14';
  } else if (days <= 186) {
    // Ícono para planes semestrales
    return 'M12 2C12 2 7 8 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z';
  } else {
    // Ícono para planes anuales
    return 'M12 2C12 2 7 8 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z';
  }
}

// Validar si una membresía está disponible
export function isMembershipAvailable(membership: Membership): boolean {
  return membership.status === 'available';
}

// Calcular descuento (si aplica)
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

// ===============================
// Verificar conectividad con el backend
// ===============================
export async function checkBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 Verificando conectividad con el backend...');
    
    // Intentar hacer una petición simple al endpoint de membresías
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(MEMBERSHIP_ENDPOINTS.AVAILABLE, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const isConnected = response.ok || response.status < 500; // Aceptar cualquier respuesta que no sea error del servidor
    console.log(isConnected ? '✅ Backend conectado' : '❌ Backend no responde');
    return isConnected;
    
  } catch (error: any) {
    console.error('❌ Error de conectividad:', error.message);
    
    // Diferentes tipos de errores de conexión
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout de conexión');
    } else if (error.message.includes('CORS')) {
      console.log('🚫 Error de CORS');
    } else if (error.message.includes('fetch')) {
      console.log('🌐 Error de red');
    }
    
    return false;
  }
}