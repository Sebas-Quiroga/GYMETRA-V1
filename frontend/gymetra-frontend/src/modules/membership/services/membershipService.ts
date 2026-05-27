import { apiGet, apiPost, apiAuthRequest, ApiResponse, MEMBERSHIP_API_URL } from '../../shared/services/apiService';
export const MEMBERSHIP_ENDPOINTS = {
  AVAILABLE: `${MEMBERSHIP_API_URL}/memberships/available`,
  PURCHASE: `${MEMBERSHIP_API_URL}/purchase`,
  USER_MEMBERSHIPS: `${MEMBERSHIP_API_URL}/memberships/user`,
  HEALTH_CHECK: `${MEMBERSHIP_API_URL}/health`,
};
export interface Membership {
  membershipId: number;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  status: string;
  training: boolean;
  nutrition: boolean;
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
  training?: boolean;
  nutrition?: boolean;
}
export async function getAvailableMemberships(): Promise<Membership[]> {
  const response = await apiAuthRequest<Membership[]>(MEMBERSHIP_ENDPOINTS.AVAILABLE, { method: 'GET' });
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'No se pudieron cargar las membresías');
}
export async function purchaseMembership(purchaseData: PurchaseRequest): Promise<any> {
  try {
    const response = await apiAuthRequest(
      MEMBERSHIP_ENDPOINTS.PURCHASE,
      {
        method: 'POST',
        body: JSON.stringify(purchaseData)
      }
    );
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Error al procesar la compra');
  } catch (error: any) {
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      throw new Error('external_payment_required: Error de conexión, redirigir a pasarela');
    }
    throw new Error(error.message || 'Error al procesar la compra');
  }
}
export async function getUserMemberships(): Promise<UserMembership[]> {
  const response = await apiAuthRequest<UserMembership[]>(
    MEMBERSHIP_ENDPOINTS.USER_MEMBERSHIPS,
    { method: 'GET' }
  );
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'No se pudieron cargar las membresías del usuario');
}
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
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
export function getMembershipIcon(days: number): string {
  if (days <= 31) {
    return 'M12 2v20M9 5h6M9 19h6M5 8h14M5 16h14';
  } else if (days <= 186) {
    return 'M12 2C12 2 7 8 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z';
  } else {
    return 'M12 2C12 2 7 8 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z';
  }
}
export function isMembershipAvailable(membership: Membership): boolean {
  return membership.status === 'available' || membership.status === 'ACTIVE';
}
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
export async function checkBackendConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(MEMBERSHIP_ENDPOINTS.AVAILABLE, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}


