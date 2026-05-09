<template>
  <div class="admin-dashboard">
    <AdminSidebar :active-section="activeSection" @logout="handleAdminLogout" />

    <div class="main-content" :class="{ 'main-content-mobile': isMobileLayout }">
      <div class="add-user-container">
        <div class="kinetic-card">
          <div class="form-header">
            <h2>
              <ion-icon :icon="createOutline"></ion-icon>
              Editar Perfil Kinetic
            </h2>
            <button @click="navigateBackToDirectory" class="back-btn">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Volver</span>
            </button>
          </div>

          <div v-if="userActiveMembership" class="membership-status-banner" :class="userActiveMembership.status.toLowerCase()">
            <div class="status-info">
              <ion-icon :icon="checkmarkCircleOutline" class="status-icon"></ion-icon>
              <div>
                <span class="status-label">Membresía {{ userActiveMembership.status }}</span>
                <p class="status-detail">Vencimiento: {{ formatDateString(userActiveMembership.endDate) }}</p>
              </div>
            </div>
            <div class="membership-badge">
              KIN-{{ userActiveMembership.id }}
            </div>
          </div>
          
          <div v-else-if="!isDataLoading && !isMembershipLoading" class="membership-status-banner inactive">
            <div class="status-info">
              <ion-icon :icon="refreshOutline" class="status-icon"></ion-icon>
              <div>
                <span class="status-label">Sin Membresía Activa</span>
                <p class="status-detail">Este usuario no cuenta con una suscripción vigente.</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleUpdateSubmit" class="add-user-form" v-if="!isDataLoading">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.firstName"
                    type="text"
                    class="form-input"
                    placeholder="Ingrese el nombre"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Apellido</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.lastName"
                    type="text"
                    class="form-input"
                    placeholder="Ingrese el apellido"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.email"
                    type="email"
                    class="form-input"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.phone"
                    type="tel"
                    class="form-input"
                    placeholder="300 000 0000"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Número de Identificación</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="cardOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.identification"
                    type="number"
                    class="form-input"
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Rol Asignado</label>
                <div class="input-wrapper-kinetic input-select-wrapper">
                  <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                  <select v-model="editProfileForm.role" class="form-input select-input" required>
                    <option value="" disabled>Seleccione un rol</option>
                    <option v-for="role in availableRoles" :key="role.roleId" :value="role.roleName">
                      {{ role.roleName }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group span-full">
                <label class="form-label">Nueva Contraseña <span class="optional-hint">(Opcional)</span></label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="editProfileForm.password"
                    type="password"
                    class="form-input"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isUpdateProcessing">
                <ion-icon :icon="isUpdateProcessing ? refreshOutline : checkmarkOutline" :class="{ 'spin-kinetic': isUpdateProcessing }" class="btn-icon"></ion-icon>
                {{ isUpdateProcessing ? 'Guardando...' : 'Actualizar Perfil' }}
              </button>
            </div>
          </form>

          <KineticLoading 
            v-else
            title="Sincronización de Perfil"
            message="Actualizando los registros del sistema..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminSidebar from '@/components/AdminSidebar.vue';
import KineticLoading from '@/components/KineticLoading.vue';
import { userService, type Role } from '../services/userService';
import { membershipService, type UserMembership } from '../../payments/services/membershipService';
import { logout as performAdminLogout } from "../../auth/services/authService";
import {
  personOutline, mailOutline, callOutline, cardOutline, lockClosedOutline,
  refreshOutline, checkmarkOutline, checkmarkCircleOutline, arrowBackOutline,
  createOutline, shieldCheckmarkOutline
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();
const isMobileLayout = ref(false);
const activeSection = ref('users');
const isDataLoading = ref(true);
const isUpdateProcessing = ref(false);
const isMembershipLoading = ref(false);
const availableRoles = ref<Role[]>([]);
const userActiveMembership = ref<UserMembership | null>(null);

const userId = route.params.userId as string;

const editProfileForm = reactive({
  firstName: '', lastName: '', email: '', phone: '', identification: '', role: '', password: ''
});

const snapshotUserData = reactive({
  firstName: '', lastName: '', email: '', phone: '', identification: '', role: '', roleId: 0
});

const checkResponsiveLayout = () => { isMobileLayout.value = window.innerWidth <= 768; };

const loadInitialData = async () => {
  try {
    isDataLoading.value = true;
    const [rolesData, usersData] = await Promise.all([
      userService.getRoles(),
      userService.getAllUsers()
    ]);
    
    availableRoles.value = rolesData || [];
    const targetUser = usersData.find(u => u.userId === parseInt(userId));
    
    if (!targetUser) return router.push('/adminpanel');
    
    populateForm(targetUser);
    await loadUserMembershipData();
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    router.push('/adminpanel');
  } finally {
    isDataLoading.value = false;
  }
};

const populateForm = (user: any) => {
  editProfileForm.firstName = user.firstName;
  editProfileForm.lastName = user.lastName;
  editProfileForm.email = user.email;
  editProfileForm.phone = user.phone || '';
  editProfileForm.identification = user.identification.toString();
  editProfileForm.role = user.role || 'user';
  
  Object.assign(snapshotUserData, { ...editProfileForm });
  const matchedRole = availableRoles.value.find(r => r.roleName === editProfileForm.role);
  snapshotUserData.roleId = matchedRole ? matchedRole.roleId : 0;
};

const loadUserMembershipData = async () => {
  try {
    isMembershipLoading.value = true;
    const memberships = await membershipService.getAllUserMemberships();
    const userHistory = memberships
      .filter(m => m.userId === parseInt(userId))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    userActiveMembership.value = userHistory.find(m => m.status === 'ACTIVE') || userHistory[0] || null;
  } catch (error) {
    console.error('Error cargando membresía:', error);
  } finally {
    isMembershipLoading.value = false;
  }
};

const handleUpdateSubmit = async () => {
  try {
    isUpdateProcessing.value = true;
    const changes = detectChanges();
    if (Object.keys(changes).length === 0) return router.push('/adminpanel');

    const response = await userService.updateUser(parseInt(userId), changes);
    if (response.success) router.push('/adminpanel');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
  } finally {
    isUpdateProcessing.value = false;
  }
};

const detectChanges = () => {
  const diff: any = {};
  if (editProfileForm.firstName !== snapshotUserData.firstName) diff.firstName = editProfileForm.firstName.trim();
  if (editProfileForm.lastName !== snapshotUserData.lastName) diff.lastName = editProfileForm.lastName.trim();
  if (editProfileForm.email !== snapshotUserData.email) diff.email = editProfileForm.email.trim().toLowerCase();
  if (editProfileForm.phone !== snapshotUserData.phone) diff.phone = editProfileForm.phone.trim() || null;
  if (editProfileForm.identification !== snapshotUserData.identification) diff.identification = parseInt(editProfileForm.identification);
  
  const selectedRole = availableRoles.value.find(r => r.roleName === editProfileForm.role);
  if (selectedRole && selectedRole.roleId !== snapshotUserData.roleId) diff.roleId = selectedRole.roleId;
  if (editProfileForm.password) diff.password = editProfileForm.password;
  
  return diff;
};

const formatDateString = (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A';

const navigateBackToDirectory = () => router.push('/adminpanel');
const handleAdminLogout = () => performAdminLogout();

onMounted(() => {
  checkResponsiveLayout();
  window.addEventListener('resize', checkResponsiveLayout);
  loadInitialData();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkResponsiveLayout);
});
</script>

<style>
@import '../../../theme/AddUserPage.css';

.membership-status-banner {
  margin: 0 40px 20px;
  padding: 20px 30px;
  border-radius: var(--admin-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 6px solid transparent;
}

.membership-status-banner.active { background: rgba(39, 174, 96, 0.1); border-left-color: #27ae60; }
.membership-status-banner.pending { background: rgba(255, 152, 0, 0.1); border-left-color: #ff9800; }
.membership-status-banner.inactive, .membership-status-banner.expired { background: rgba(186, 26, 26, 0.1); border-left-color: #ba1a1a; }

.status-info { display: flex; align-items: center; gap: 15px; }
.status-icon { font-size: 2rem; color: inherit; }
.status-label { font-family: var(--app-font-brand); font-weight: 800; font-size: 1.1rem; color: var(--admin-text-main); text-transform: uppercase; }
.status-detail { margin: 0; font-size: 0.9rem; color: var(--admin-text-sub); font-weight: 600; }
.membership-badge { background: var(--admin-bg-card); padding: 8px 16px; border-radius: 100px; font-weight: 800; font-size: 0.8rem; border: 1px solid var(--admin-border); color: var(--admin-text-sub); }

.span-full { grid-column: span 2; }
.optional-hint { font-size: 0.8rem; font-weight: 500; opacity: 0.6; }
.input-select-wrapper { padding-left: 52px !important; }
.select-input { padding-left: 0 !important; cursor: pointer; }
.btn-icon { margin-right: 10px; }

@media (max-width: 768px) {
  .membership-status-banner { margin: 0 20px 20px; flex-direction: column; align-items: flex-start; gap: 15px; }
  .span-full { grid-column: span 1; }
}
</style>