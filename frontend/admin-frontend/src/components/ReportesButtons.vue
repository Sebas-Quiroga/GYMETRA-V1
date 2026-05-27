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
import type { User, Payment } from '../types/reports'

// Props
interface Props {
  type: 'users' | 'payments'
  users: User[]
  payments: Payment[]
  loading: boolean
}

const props = defineProps<Props>()
</script>

<style scoped>
.export-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
