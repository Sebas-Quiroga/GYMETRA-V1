<template>
  <div v-if="totalItems > 0" class="pagination-container">
    <div class="pagination-info">
      Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} {{ itemName }}
      <span class="pagination-page-indicator">
        (Página {{ currentPage }} de {{ totalPages }})
      </span>
    </div>

    <div class="pagination-controls">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn pagination-prev"
        title="Página anterior"
      >
        <ion-icon :icon="chevronBackOutline"></ion-icon>
        Anterior
      </button>

      <div class="pagination-numbers">
        <!-- Mostrar páginas múltiples cuando hay más de una -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="['pagination-btn pagination-number', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn pagination-next"
        title="Página siguiente"
      >
        Siguiente
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </button>
    </div>

    <div class="pagination-page-size">
      <label for="pageSize">Mostrar:</label>
      <select
        :id="'pageSize-' + componentId"
        v-model="internalPageSize"
        @change="changePageSize"
        class="page-size-select"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
      <span>{{ itemName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons'

// Props
interface Props {
  totalItems: number
  currentPage: number
  pageSize: number
  itemName?: string
  componentId?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemName: 'elementos',
  componentId: 'default'
})

// Emits
const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

// Estado interno para el selector de tamaño
const internalPageSize = ref(props.pageSize)

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))
const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

// Páginas visibles en la paginación
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  // Ajustar si estamos cerca del final
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Funciones
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}

const changePageSize = () => {
  emit('update:pageSize', internalPageSize.value)
  // Resetear a la primera página cuando cambia el tamaño
  emit('update:currentPage', 1)
}

// Sincronizar el estado interno cuando cambian las props
watch(() => props.pageSize, (newSize) => {
  internalPageSize.value = newSize
})
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 15px 0;
  border-top: 1px solid var(--admin-border);
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--admin-text-sub);
  font-weight: 700;
  font-family: var(--app-font-brand);
}

.pagination-page-indicator {
  display: inline-block;
  margin-left: 10px;
  opacity: 0.6;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--admin-border);
  background: var(--admin-bg-card);
  color: var(--admin-text-main);
  border-radius: 99px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 800;
  transition: var(--admin-transition);
  min-width: 38px;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--admin-accent-soft);
  border-color: var(--admin-accent);
  color: var(--admin-accent);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: var(--admin-accent);
  color: white;
  border-color: var(--admin-accent);
  box-shadow: 0 4px 12px var(--admin-accent-soft);
}

.pagination-number {
  padding: 8px;
  width: 38px;
  height: 38px;
  font-family: var(--app-font-brand);
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.page-size-select {
  padding: 8px 12px;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-bg-subtle);
  font-size: 0.85rem;
  color: var(--admin-text-main);
  font-weight: 700;
  cursor: pointer;
  margin-left: 10px;
  transition: var(--admin-transition);
}

.page-size-select:focus {
  outline: none;
  border-color: var(--admin-accent);
  box-shadow: 0 0 0 3px var(--admin-accent-soft);
}

.pagination-page-size {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--admin-text-sub);
  font-weight: 700;
}

/* Responsive pagination */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 20px;
    padding: 20px 0;
  }

  .pagination-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .pagination-info {
    order: 2;
  }

  .pagination-page-size {
    order: 3;
  }
}
</style>