<template>
  <div class="kinetic-loading-container">
    <div class="loader-wrapper">
      <div class="spinner-kinetic">
        <div class="inner-ring"></div>
        <div class="outer-ring"></div>
        <img src="/logo.png" alt="Logo Gymetra" class="center-logo" />
      </div>
      <div class="text-kinetic">
        <h3>{{ title || 'Sincronizando Sistema' }}</h3>
        <p>{{ message || 'Obteniendo datos desde el núcleo Kinetic...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

<style scoped>
.kinetic-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.spinner-kinetic {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-logo {
  width: 45px;
  height: auto;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(4, 184, 229, 0.4));
  animation: pulse-kinetic 2s infinite ease-in-out;
}

.inner-ring, .outer-ring {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
}

.inner-ring {
  width: 70px;
  height: 70px;
  border-top-color: var(--admin-accent);
  animation: spin-kinetic 1.5s linear infinite;
}

.outer-ring {
  width: 100px;
  height: 100px;
  border-bottom-color: rgba(4, 184, 229, 0.2);
  border-left-color: var(--admin-accent);
  animation: spin-kinetic 2s linear infinite reverse;
}

.text-kinetic {
  text-align: center;
}

.text-kinetic h3 {
  font-family: var(--app-font-brand);
  font-weight: 900;
  color: var(--admin-text-main);
  margin: 0;
  letter-spacing: -0.5px;
  font-size: 1.25rem;
}

.text-kinetic p {
  color: var(--admin-text-sub);
  font-size: 0.9rem;
  margin: 4px 0 0;
  font-weight: 600;
}

@keyframes spin-kinetic {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-kinetic {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
</style>
