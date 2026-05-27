import { ref, computed } from "vue";
import { apiAuthRequest, MEMBERSHIP_API_URL } from "../../shared/services/apiService";

const userMemberships = ref<any[]>([]);
const isLoadingMemberships = ref(false);

export const useUserMembership = (userId: string | number | undefined) => {
  const loadMemberships = async () => {
    if (!userId) return;
    
    isLoadingMemberships.value = true;
    try {
      const response = await apiAuthRequest(`${MEMBERSHIP_API_URL}/user-memberships/user/${userId}`);
      if (!response.success || !response.data) {
        userMemberships.value = [];
        return;
      }

      userMemberships.value = (Array.isArray(response.data) ? response.data : [])
        .filter((membership: any) => membership.status?.toUpperCase() === "ACTIVE")
        .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    } catch {
      userMemberships.value = [];
    } finally {
      isLoadingMemberships.value = false;
    }
  };

  const activeMembership = computed(() => userMemberships.value[0] || null);

  const daysRemaining = computed(() => {
    if (isLoadingMemberships.value) return "--";
    if (!activeMembership.value?.endDate) return "0";

    const endDate = new Date(activeMembership.value.endDate);
    const today = new Date();
    
    endDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);
    
    const timeDifference = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDifference / 86400000)).toString();
  });

  const membershipStatus = computed(() => {
    const days = parseInt(daysRemaining.value);
    if (isLoadingMemberships.value) return "loading";
    if (isNaN(days) || days === 0) return "none";
    if (days <= 3) return "critical";
    if (days <= 7) return "warning";
    return "active";
  });

  const hasPermission = (type: 'training' | 'nutrition') => {
    if (isLoadingMemberships.value || !activeMembership.value) return false;
    return activeMembership.value.membership?.[type] === true;
  };

  return {
    userMemberships,
    isLoadingMemberships,
    loadMemberships,
    activeMembership,
    daysRemaining,
    membershipStatus,
    hasPermission
  };
};
