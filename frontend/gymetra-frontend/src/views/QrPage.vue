<template>
	<ion-page>
		<div class="qr-header-bar">
			<button class="qr-back-btn" @click="$router.back()">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
			</button>
			<span class="qr-header-title">Escanear QR</span>
		</div>
		<ion-content>
					<div class="qr-container">
						<div class="qr-card">
							<div class="qr-title">QR de acceso</div>
							<div class="qr-image">
								<!-- Aquí puedes usar un componente de QR real, por ahora es un placeholder SVG -->
								<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GYMETRA-USER-ACCESS" alt="QR acceso" />
							</div>
							<div class="qr-status">
								Membresía activa
								<div class="qr-date">hasta el 20/10/2025</div>
							</div>
						</div>
					</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
// Vista inicial de QR
</script>

<style src="../theme/QrPage.css"></style>
