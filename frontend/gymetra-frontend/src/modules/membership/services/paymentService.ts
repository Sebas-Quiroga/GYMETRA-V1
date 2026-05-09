import { apiAuthRequest, MEMBERSHIP_API_URL } from './apiService';
import { useAuthStore } from '../../auth/store/auth';
let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe() {
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!pk) console.warn('VITE_STRIPE_PUBLIC_KEY no configurada');
    stripePromise = loadStripe(pk);
  }
  return stripePromise!;
}
type CreatePIResponse = { clientSecret: string; membershipName?: string; amount?: number };
const API_BASE = import.meta.env.VITE_API_BASE_URL || MEMBERSHIP_API_URL;
export async function createPaymentIntent(membershipId: number): Promise<CreatePIResponse> {
  const auth = useAuthStore();
  const userId = auth.user?.userId;
  if (!userId) {
    throw new Error('Debe iniciar sesión para realizar un pago');
  }
  const response = await apiAuthRequest(`${API_BASE}/payments/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify({ membershipId, userId })
  });
  if (!response.success) {
    throw new Error(response.message || 'No se pudo crear el intento de pago');
  }
  return response.data;
}
export async function confirmPaymentInBackend(paymentIntentId: string, membershipId: number) {
  const auth = useAuthStore();
  const userId = auth.user?.userId;
  if (!userId) {
    throw new Error('Sesión perdida al confirmar pago');
  }
  const response = await apiAuthRequest(`${API_BASE}/payments/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId, membershipId, userId })
  });
  if (!response.success) {
    throw new Error(response.message || 'Error al confirmar el pago en el servidor');
  }
  return response.data;
}

