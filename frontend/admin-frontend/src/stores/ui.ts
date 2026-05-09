import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Estado del sidebar (colapsado o extendido)
  // Inicializar desde localStorage para persistencia
  const isSidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('sidebar-collapsed', isSidebarCollapsed.value.toString())
  }

  const setSidebarCollapsed = (value: boolean) => {
    isSidebarCollapsed.value = value
    localStorage.setItem('sidebar-collapsed', value.toString())
  }

  return {
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  }
})
