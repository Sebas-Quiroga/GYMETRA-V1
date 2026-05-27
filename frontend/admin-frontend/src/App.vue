<template>
  <div id="app" :class="{ 'sidebar-collapsed-active': uiStore.isSidebarCollapsed }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
const uiStore = useUIStore()
</script>

<style scoped>
#app {
  font-family: var(--app-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--admin-text-main);
  background: var(--admin-bg-page);
  min-height: 100vh;
}
</style>
