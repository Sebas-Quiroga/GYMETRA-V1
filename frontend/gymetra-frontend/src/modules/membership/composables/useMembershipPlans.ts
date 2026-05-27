import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../auth/store/auth';
import {
  getAvailableMemberships,
  isMembershipAvailable,
  type Membership
} from '../services/membershipService';
import { useNotification } from '../../shared/composables/useNotification';

export function useMembershipPlans() {
  const auth = useAuthStore();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const memberships = ref<Membership[]>([]);
  const loading = ref(false);
  const error = ref('');
  const purchasing = ref(false);
  const selectedPlanName = ref('');

  const isFeatured = (index: number) => {
    if (memberships.value.length === 1) return true;
    if (memberships.value.length === 2) return index === 0;
    return index === 1;
  };

  const beautifyMembership = (membership: Membership): Membership => {
    const name = membership.planName.toLowerCase();
    let newName = membership.planName;
    let newDesc = membership.description || '';
    let newFeatures: string[] = ['Acceso a piso de gimnasio', 'App móvil incluida'];
    
    if (name.includes('mensual')) {
      newName = 'Membresía Impulse';
      newDesc = 'La flexibilidad que necesitas para tu primer paso hacia la élite. Acceso total a todas nuestras áreas de entrenamiento.';
      newFeatures = ['Acceso total a piso de gimnasio', 'Casillero diario incluido', 'App KINETIC básica'];
    } else if (name.includes('semestral')) {
      newName = 'Plan Discipline';
      newDesc = 'Consolida tu rendimiento. Seis meses de compromiso real con tu mejor versión, incluyendo seguimiento personalizado.';
      newFeatures = ['Todo lo de Impulse', '1 Sesión de Entrenamiento Personal', 'Plan Nutricional Digital', 'Evaluación física bimensual'];
    } else if (name.includes('anual')) {
      newName = 'Acceso Legend';
      newDesc = 'Nuestra experiencia definitiva. Un año de transformación total con acceso VIP a servicios exclusivos y soporte prioritario.';
      newFeatures = ['Todo lo de Discipline', 'Acceso a Spa & Sauna ilimitado', 'Kit de bienvenida Legend', 'Soporte prioritario 24/7'];
    }
    return { ...membership, planName: newName, description: newDesc, features: newFeatures };
  };

  const loadMemberships = async () => {
    if (!auth.token) { router.push('/login'); return; }
    loading.value = true;
    error.value = '';
    try {
      const data = await getAvailableMemberships();
      memberships.value = data.map(beautifyMembership);
    } catch (err: any) {
      error.value = err.message;
      showNotification('error', 'Error al cargar planes', err.message);
    } finally {
      loading.value = false;
    }
  };

  const selectPlan = (membership: Membership) => {
    if (!auth.token) { router.push('/login'); return; }
    if (!isMembershipAvailable(membership)) {
      showNotification('warning', 'Plan no disponible', 'Intenta con otro plan.');
      return;
    }
    selectedPlanName.value = membership.planName;
    router.push({
      path: '/Pasarelapago',
      query: { plan: encodeURIComponent(JSON.stringify(membership)) }
    });
  };

  onMounted(loadMemberships);

  return {
    memberships,
    loading,
    error,
    purchasing,
    selectedPlanName,
    isFeatured,
    loadMemberships,
    selectPlan
  };
}
