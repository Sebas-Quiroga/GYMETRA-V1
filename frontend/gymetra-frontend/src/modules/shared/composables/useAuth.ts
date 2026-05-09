import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../auth/store/auth';

export function useAuth() {
  const router = useRouter();
  const auth = useAuthStore();
  const isLoading = ref(false);

  const isAuthenticatedUser = computed(() => auth.isAuthenticated);
  const userToken = computed(() => auth.token);
  
  const currentUserInfo = computed(() => {
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

  const handleLogout = async () => {
    isLoading.value = true;
    try {
      await auth.logout();
      router.push('/login');
    } finally {
      isLoading.value = false;
    }
  };

  const getAuthHeaders = () => {
    if (!auth.token) return {};
    return {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json'
    };
  };

  return {
    isAuthenticatedUser,
    userToken,
    currentUserInfo,
    isLoading,
    handleLogout,
    getAuthHeaders
  };
}
