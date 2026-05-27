import { ref, computed, onMounted } from 'vue';
import { apiAuthRequest, QR_API_URL, MEMBERSHIP_API_URL } from '../../shared/services/apiService';

export function useQrAccess(userId: number | string | undefined) {
  const qrCode = ref<string | null>(null);
  const qrStatus = ref('');
  const qrEndDate = ref<string | null>(null);
  const loading = ref(true);
  const activeMembership = ref<any>(null);

  const isActive = computed(() => qrStatus.value.toLowerCase().includes('activa'));
  
  const memberSince = computed(() => {
    if (!activeMembership.value?.startDate) return '---';
    return new Date(activeMembership.value.startDate).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });
  
  const planName = computed(() => activeMembership.value?.membership?.planName || 'Sin Plan');

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  const loadQrAccessData = async () => {
    if (!userId) {
      qrStatus.value = 'Usuario no autenticado';
      loading.value = false;
      return;
    }

    try {
      loading.value = true;
      const qrResponse = await apiAuthRequest(`${QR_API_URL}/qr-access/user/${userId}`);
      
      if (qrResponse.success && qrResponse.data) {
        const data = qrResponse.data;
        qrCode.value = data.qrCode;
        qrEndDate.value = data.endDate ? formatDate(data.endDate) : null;
        
        const status = data.status?.toLowerCase();
        if (status === 'active') {
          qrStatus.value = 'Membresía activa';
        } else if (status === 'inactive') {
          qrStatus.value = 'Membresía inactiva';
        } else {
          qrStatus.value = data.status || 'sin datos';
        }
        localStorage.setItem('qrCodeData', data.qrCode);
      }

      const membershipResponse = await apiAuthRequest(`${MEMBERSHIP_API_URL}/user-memberships/user/${userId}`);
      if (membershipResponse.success && membershipResponse.data) {
        const memberships = Array.isArray(membershipResponse.data) ? membershipResponse.data : [];
        activeMembership.value = memberships
          .filter((membership: any) => membership.status?.toUpperCase() === 'ACTIVE')
          .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null;
      }
    } catch (error) {
      qrStatus.value = 'Error de conexión';
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadQrAccessData();
  });

  return {
    qrCode,
    qrStatus,
    qrEndDate,
    loading,
    activeMembership,
    isActive,
    memberSince,
    planName,
    loadQrAccessData
  };
}
