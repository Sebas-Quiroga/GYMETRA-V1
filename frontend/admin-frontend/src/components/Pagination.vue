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
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-page-indicator {
  display: block;
  font-size: 12px;
  color: #adb5bd;
  margin-top: 2px;
  font-weight: 400;
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
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn.active {
  background: #00BCD4;
  color: white;
  border-color: #00BCD4;
  font-weight: 600;
}

.pagination-prev,
.pagination-next {
  font-weight: 600;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
  margin: 0 12px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  margin-left: 8px;
}

.page-size-select:focus {
  outline: none;
  border-color: #00BCD4;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
}

.pagination-page-size {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
}

.pagination-page-size label {
  margin-right: 8px;
  font-weight: 500;
}

.pagination-page-size span {
  margin-left: 4px;
}

/* Responsive pagination */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin: 8px 0;
  }

  .pagination-info {
    order: 1;
    text-align: center;
  }

  .pagination-page-indicator {
    font-size: 11px;
  }

  .pagination-page-size {
    order: 3;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 32px;
  }

  .pagination-numbers {
    gap: 2px;
  }

  .pagination-prev ion-icon,
  .pagination-next ion-icon {
    display: none;
  }

  .pagination-prev::before {
    content: "‹";
    font-size: 16px;
  }

  .pagination-next::after {
    content: "›";
    font-size: 16px;
  }
}
</style>