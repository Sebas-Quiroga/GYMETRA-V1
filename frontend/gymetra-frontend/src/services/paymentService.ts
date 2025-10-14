// src/services/paymentService.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!pk) console.warn('VITE_STRIPE_PUBLIC_KEY no configurada');
    stripePromise = loadStripe(pk);
  }
  return stripePromise!;
}

type CreatePIResponse = { clientSecret: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export async function createPaymentIntent(membershipId: number): Promise<CreatePIResponse> {
  const res = await fetch(`${API_BASE}/payments/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ membershipId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'No se pudo crear el PaymentIntent');
  }
  return res.json();
}

export async function confirmPaymentInBackend(paymentIntentId: string, membershipId: number, userId?: number) {
  const res = await fetch(`${API_BASE}/payments/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ paymentIntentId, membershipId, userId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Error al confirmar en backend');
  }
  return res.json().catch(() => ({}));
}
