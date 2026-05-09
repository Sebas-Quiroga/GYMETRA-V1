<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>
<style>
:root {
  --ion-font-family: var(--app-font-brand), sans-serif;
}
body {
  background: var(--bg-page);
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-sub);
}
</style>
