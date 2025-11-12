<template>
  <ion-page>
    <div class="planes-header-bar">
      <button class="planes-back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="planes-header-title">Planes</span>
    </div>
    <ion-content class="planes-content">
      <div class="planes-list">
        <div class="plan-card">
          <div class="plan-price">$ 50.000</div>
          <div class="plan-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M9 5h6M9 19h6M5 8h14M5 16h14"/></svg>
          </div>
          <div class="plan-duration">1 mes</div>
          <button class="plan-btn">Pagar plan</button>
        </div>
        <div class="plan-card">
          <div class="plan-price">$ 280.000</div>
          <div class="plan-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C12 2 7 8 7 12a5 5 0 0 0 10 0c0-4-5-10-5-10z"/><path d="M12 22v-4"/></svg>
          </div>
          <div class="plan-duration">6 meses</div>
          <button class="plan-btn">Pagar plan</button>
        </div>
        <div class="plan-card">
          <div class="plan-price">$ 550.000</div>
          <div class="plan-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><path d="M8 21h8l-4-7z"/></svg>
          </div>
          <div class="plan-duration">12 meses</div>
          <button class="plan-btn">Pagar plan</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Página de Planes (virgen)
</script>

<style>
.planes-header-bar {
  background: #07B7E0;
  min-height: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  box-shadow: none;
}
.planes-back-btn {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: pointer;
  padding: 0;
}
.planes-header-title {
  color: #fff;
  font-size: 1.45rem;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
}
.planes-content {
  --background: #fff !important;
  background: #fff !important;
  min-height: 100vh;
  padding: 0;
}
.planes-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  margin: 40px 0;
}
.plan-card {
  background: #07B7E0;
  border-radius: 28px;
  width: 90vw;
  max-width: 320px;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 18px 0 18px 0;
}
.plan-price {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: 'Nunito', sans-serif;
}
.plan-icon {
  margin-bottom: 8px;
}
.plan-duration {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 400;
  font-family: 'Nunito', sans-serif;
  margin-bottom: 16px;
}
.plan-btn {
  width: 85%;
  padding: 14px 0;
  background: #fff;
  color: #07B7E0;
  border: none;
  border-radius: 32px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  letter-spacing: 0.5px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.plan-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
.plan-btn:hover:not(:disabled) {
  background: #07B7E0;
  color: #fff;
}
</style>
