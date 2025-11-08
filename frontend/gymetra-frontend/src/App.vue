<template>
  <router-view />
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>

<style>
body, #app, ion-app, ion-content {
  background: #07B7E0 !important;
  min-height: 100vh;
}

/* Override para vista QR */
body.qr-page, body.qr-page ion-content {
  background: #ffffff !important;
}

/* Override para vista Home */
body.home-page, body.home-page ion-content {
  background: #ffffff !important;
}
</style>
