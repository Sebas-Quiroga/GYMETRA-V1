import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isAuthenticated, getToken, decodeJWT, logout } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const router = useRouter();
  const isLoading = ref(false);

  // Estado de autenticación reactivo
  const authenticated = computed(() => isAuthenticated());
  const token = computed(() => getToken());

  // Obtener información del usuario desde el store (Consumimos el nuevo sistema)
  const userInfo = computed(() => {
    const auth = useAuthStore();
    if (!auth.user) return null;
    
    return {
      userId: auth.user.userId,
      email: auth.user.email,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      status: auth.user.status,
      photoUrl: auth.user.photoUrl,
      cognitoSub: auth.user.cognitoSub
    };
  });

  // Verificar autenticación y redirigir si es necesario
  const requireAuth = (redirectTo: string = '/login') => {
    if (!isAuthenticated()) {
      console.warn('🔒 Usuario no autenticado, redirigiendo al login');
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  // Manejar logout
  const handleLogout = () => {
    console.log('👋 Cerrando sesión...');
    logout();
  };

  // Verificar si el token está por expirar (opcional)
  const isTokenExpiringSoon = computed(() => {
    const user = userInfo.value;
    if (!user?.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = user.exp - now;
    const fiveMinutes = 5 * 60;
    
    return timeLeft <= fiveMinutes;
  });

  // Obtener headers de autorización para peticiones API
  const getAuthHeaders = () => {
    const currentToken = getToken();
    if (!currentToken) return {};
    
    return {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json'
    };
  };

  // Hook para inicializar autenticación en componentes
  const initAuth = (options: { requireAuth?: boolean, redirectTo?: string } = {}) => {
    const { requireAuth: needsAuth = false, redirectTo = '/login' } = options;
    
    if (needsAuth && !requireAuth(redirectTo)) {
      return false;
    }
    
    console.log('✅ Usuario autenticado:', userInfo.value?.email || 'Usuario');
    return true;
  };

  return {
    // Estado
    authenticated,
    token,
    userInfo,
    isLoading,
    isTokenExpiringSoon,
    
    // Métodos
    requireAuth,
    handleLogout,
    getAuthHeaders,
    initAuth
  };
}