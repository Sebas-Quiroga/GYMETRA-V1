// Declaración de tipos para Stripe
declare global {
  interface Window {
    Stripe: (publishableKey: string) => any;
  }
}

export {};