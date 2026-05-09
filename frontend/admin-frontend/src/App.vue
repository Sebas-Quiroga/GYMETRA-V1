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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>