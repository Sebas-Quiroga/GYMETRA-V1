<template>
  <div class="export-buttons">
    <ExcelButton
      :type="type"
      :users="users"
      :payments="payments"
      :loading="loading"
    />
    <PdfButton
      :type="type"
      :users="users"
      :payments="payments"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import ExcelButton from './ExcelButton.vue'
import PdfButton from './PdfButton.vue'

// Props
interface Props {
  type: 'users' | 'payments'
  users: User[]
  payments: Payment[]
  loading: boolean
}

const props = defineProps<Props>()

// Interface para definir la estructura de datos de usuario
interface User {
  id?: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
  identificacion: number
  estado: 'Activo' | 'Vencido' | 'Suspendido'
  fechaCreacion: Date | string
}

// Interface para definir la estructura de datos de pago
interface Payment {
  id?: number
  idPago: string
  identificacion: string
  persona: string
  fechaPago: Date | string
  costo: number
  plan: string
  estado: 'Completado' | 'Pendiente' | 'Fallido'
  metodoPago?: string
}
</script>

<style scoped>
.export-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
