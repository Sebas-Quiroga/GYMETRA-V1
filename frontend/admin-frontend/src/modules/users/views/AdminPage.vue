<template>
  <div class="admin-dashboard">
    <AdminSidebar :active-section="activeSection" @logout="handleLogout" />

    <div class="main-content" :class="{ 'main-content-mobile': isMobileView }">
      <KineticLoading 
        v-if="isDataLoading" 
        title="Gestión de Usuarios" 
        message="Sincronizando el directorio maestro con el núcleo Kinetic..." 
      />
      
      <div v-else class="dashboard-content">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <ion-icon :icon="peopleOutline"></ion-icon>
            </div>
            <div class="stat-number">{{ userList.length }}</div>
            <div class="stat-label">Usuarios Totales</div>
            <div class="stat-subtitle">Historial de registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1);">
              <ion-icon :icon="checkmarkCircleOutline" style="color: #27ae60;"></ion-icon>
            </div>
            <div class="stat-number">{{ activeUsersCount }}</div>
            <div class="stat-label">Miembros Activos</div>
            <div class="stat-subtitle">Acceso total habilitado</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(186, 26, 26, 0.1);">
              <ion-icon :icon="banOutline" style="color: #ba1a1a;"></ion-icon>
            </div>
            <div class="stat-number">{{ suspendedUsersCount }}</div>
            <div class="stat-label">Suspendidos</div>
            <div class="stat-subtitle">Cuentas con restricciones</div>
          </div>
        </div>

        <div class="users-table-container">
          <div class="table-header">
            <h2>
              <ion-icon :icon="peopleOutline"></ion-icon>
              Directorio de Usuarios
            </h2>
            <div class="header-actions">
              <button @click="handleSyncCognito" class="sync-users-btn" :disabled="isSyncingInProgress">
                <ion-icon :icon="syncOutline" :class="{ 'spin': isSyncingInProgress }"></ion-icon>
                <span>{{ isSyncingInProgress ? 'Sincronizando...' : 'Sincronizar Cognito' }}</span>
              </button>
              <button @click="navigateToAddUser" class="add-user-btn">
                <ion-icon :icon="personAddOutline"></ion-icon>
                <span>Agregar Usuario</span>
              </button>
            </div>
          </div>
          
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Identificación</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedItems" :key="user.id || user.email">
                <td>
                  <div class="user-info-cell">
                    <span class="user-full-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="user-email-sub">{{ user.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="user-phone">{{ user.phone || 'Sin teléfono' }}</span>
                </td>
                <td>
                  <span class="user-id-badge">{{ user.identification }}</span>
                </td>
                <td :class="getUserStatusClass(user.status)">
                  <span class="status-badge">{{ translateStatus(user.status) }}</span>
                </td>
                <td>
                  <span class="user-date">{{ formatDateTime(user.createdAt) }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <label class="kinetic-toggle" :title="getStatusToggleLabel(user.status)">
                      <input 
                        type="checkbox" 
                        :checked="user.status === 'active'"
                        @change="handleStatusToggle(user)"
                        :disabled="isStatusUpdating"
                      />
                      <span class="toggle-slider-kinetic"></span>
                    </label>

                    <button @click="navigateToEditUser(user)" class="action-btn edit-btn" title="Editar">
                      <ion-icon :icon="createOutline"></ion-icon>
                    </button>
                    
                    <button @click="initiateUserDeletion(user)" class="action-btn delete-btn" title="Eliminar">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="userList.length === 0">
                <td colspan="6" class="empty-table-cell">
                  <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
                  <div class="empty-text">No se encontraron usuarios</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="userList.length > 0" class="pagination-container">
            <div class="pagination-info">
              Mostrando <strong>{{ startItemIndex }} - {{ endItemIndex }}</strong> de {{ totalItemsCount }}
            </div>

            <div class="pagination-controls">
              <button
                @click="goToPage(currentPageIndex - 1)"
                :disabled="currentPageIndex === 1"
                class="pagination-btn"
              >
                Anterior
              </button>

              <div class="pagination-numbers">
                <button
                  v-for="page in visiblePagesList"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['pagination-btn', { active: page === currentPageIndex }]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="goToPage(currentPageIndex + 1)"
                :disabled="currentPageIndex === totalPagesCount"
                class="pagination-btn"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isDeleteModalVisible" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de que desea eliminar al usuario <strong>{{ selectedUserRef?.firstName }} {{ selectedUserRef?.lastName }}</strong>?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
          <button @click="handleConfirmDelete" class="btn-danger" :disabled="isDeletionInProgress">
            <span v-if="isDeletionInProgress">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isSuccessModalVisible" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="modal-header success">
          <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
          <h3>Usuario eliminado</h3>
        </div>
        <div class="modal-body">
          <p>El usuario <strong>{{ deletedUserNameValue }}</strong> ha sido eliminado correctamente del sistema.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeSuccessModal" class="btn-primary">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout as performAdminLogout } from "../../auth/services/authService";
import AdminSidebar from '@/components/AdminSidebar.vue';
import KineticLoading from '@/components/KineticLoading.vue';
import { userService } from '../services/userService';
import { usePaginator } from "../../shared/composables/usePaginator";
import {
  peopleOutline, checkmarkCircleOutline, banOutline, syncOutline,
  personAddOutline, createOutline, trashOutline
} from 'ionicons/icons';

const router = useRouter();
const userList = ref<any[]>([]);
const isDataLoading = ref(false);
const isSyncingInProgress = ref(false);
const isStatusUpdating = ref(false);
const isDeletionInProgress = ref(false);
const isDeleteModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const selectedUserRef = ref<any>(null);
const deletedUserNameValue = ref('');
const activeSection = ref('users');
const isMobileView = ref(false);

const {
  currentPageIndex, totalItemsCount, totalPagesCount, startItemIndex,
  endItemIndex, paginatedItems, visiblePagesList, goToPage
} = usePaginator(userList);

const activeUsersCount = computed(() => userList.value.filter(u => u.status === 'active').length);
const suspendedUsersCount = computed(() => userList.value.filter(u => u.status === 'suspended').length);

const checkResponsiveLayout = () => { isMobileView.value = window.innerWidth <= 1024; };

const loadUserDirectory = async () => {
  try {
    isDataLoading.value = true;
    const data = await userService.getAllUsers();
    userList.value = data || [];
  } catch (error) {
    console.error('Error cargando usuarios:', error);
  } finally {
    isDataLoading.value = false;
  }
};

const handleSyncCognito = async () => {
  try {
    isSyncingInProgress.value = true;
    const message = await userService.syncUsersFromCognito();
    alert(message);
    await loadUserDirectory();
  } catch (error) {
    console.error('Error sincronizando con Cognito:', error);
  } finally {
    isSyncingInProgress.value = false;
  }
};

const handleStatusToggle = async (user: any) => {
  if (!user.userId) return;
  try {
    isStatusUpdating.value = true;
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const isSuccess = await userService.updateUserStatus(user.userId, nextStatus);
    if (isSuccess) user.status = nextStatus;
  } catch (error) {
    console.error('Error actualizando estado:', error);
  } finally {
    isStatusUpdating.value = false;
  }
};

const initiateUserDeletion = (user: any) => {
  selectedUserRef.value = user;
  isDeleteModalVisible.value = true;
};

const handleConfirmDelete = async () => {
  if (!selectedUserRef.value?.userId) return;
  try {
    isDeletionInProgress.value = true;
    await userService.deleteUser(selectedUserRef.value.userId);
    deletedUserNameValue.value = `${selectedUserRef.value.firstName} ${selectedUserRef.value.lastName}`;
    isDeleteModalVisible.value = false;
    isSuccessModalVisible.value = true;
    await loadUserDirectory();
  } catch (error) {
    console.error('Error eliminando usuario:', error);
  } finally {
    isDeletionInProgress.value = false;
  }
};

const getUserStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    active: 'status-active',
    suspended: 'status-suspended',
    expired: 'status-expired'
  };
  return statusClasses[status] || '';
};

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    expired: 'Vencido'
  };
  return statusMap[status] || status;
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusToggleLabel = (status: string) => status === 'active' ? 'Suspender usuario' : 'Activar usuario';

const handleLogout = () => performAdminLogout();
const navigateToAddUser = () => router.push('/adminadduser');
const navigateToEditUser = (user: any) => router.push(`/adminedituser/${user.userId}`);
const closeDeleteModal = () => { isDeleteModalVisible.value = false; selectedUserRef.value = null; };
const closeSuccessModal = () => { isSuccessModalVisible.value = false; deletedUserNameValue.value = ''; };

onMounted(() => {
  checkResponsiveLayout();
  window.addEventListener('resize', checkResponsiveLayout);
  loadUserDirectory();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkResponsiveLayout);
});
</script>

<style>
@import '../../../theme/AdminPage.css';

.user-info-cell { display: flex; flex-direction: column; }
.user-full-name { font-weight: 800; font-family: var(--app-font-brand); }
.user-email-sub { font-size: 0.8rem; color: var(--admin-text-sub); }
.user-phone { font-size: 0.9rem; }
.user-id-badge { font-family: monospace; font-weight: 700; }
.user-date { font-size: 0.8rem; color: var(--admin-text-sub); }
.empty-table-cell { text-align: center; padding: 60px; }
.empty-icon { font-size: 48px; color: var(--admin-accent-soft); }
.empty-text { margin-top: 15px; font-weight: 700; color: var(--admin-text-sub); }

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.sync-users-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  background: var(--admin-bg-card);
  color: var(--brand-primary);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  font-family: var(--app-font-brand);
  font-weight: 800;
  cursor: pointer;
  transition: var(--admin-transition);
}

.sync-users-btn:hover:not(:disabled) {
  background: var(--admin-accent-soft);
  border-color: var(--brand-primary);
  transform: translateY(-2px);
}

.sync-users-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: var(--admin-bg-subtle);
  border-radius: var(--admin-radius-md);
  border: 1px solid var(--admin-border);
}

.pagination-info {
  font-size: 0.88rem;
  color: var(--admin-text-sub);
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--admin-border);
  background: var(--admin-bg-card);
  color: var(--admin-text-main);
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 800;
  transition: var(--admin-transition);
  min-width: 40px;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--admin-accent-soft);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  transform: translateY(-1px);
  box-shadow: none;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}
</style>
