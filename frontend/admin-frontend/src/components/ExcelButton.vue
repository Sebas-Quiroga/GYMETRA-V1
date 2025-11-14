<template>
  <button class="generate-excel-btn" @click="exportToExcel" :disabled="loading">
    <ion-icon :icon="downloadOutline"></ion-icon>
    Excel
  </button>
</template>

<script setup lang="ts">
import { downloadOutline } from 'ionicons/icons'

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

// Función auxiliar para formatear fechas
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return ''
  }
}

// Exportar a Excel
const exportToExcel = async () => {
  if (props.type === 'users') {
    await exportUsersToExcel()
  } else if (props.type === 'payments') {
    await exportPaymentsToExcel()
  }
}

// Exportar usuarios a Excel con diseño profesional
const exportUsersToExcel = async () => {
  try {
    console.log('📊 Generando reporte Excel con diseño profesional...')

    // Verificar que hay datos
    if (!props.users || props.users.length === 0) {
      alert('No hay usuarios para exportar.')
      return
    }

<<<<<<< Updated upstream
    // Importar XLSX dinámicamente
    const XLSX = await import('xlsx')
=======
    // Importar XLSX dinámicamente con manejo de errores
    let XLSX
    try {
      XLSX = await import('xlsx')
    } catch (error) {
      console.error('xlsx no está instalado:', error)
      alert('La biblioteca xlsx no está instalada. Instale xlsx para generar reportes Excel.')
      return
    }
>>>>>>> Stashed changes

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()

    // === HOJA 1: PORTADA CON DISEÑO ===
    const coverData = [
      ['🏋️‍♂️ GYMETRA - REPORTE EJECUTIVO'],
      [''],
      ['📊 USUARIOS REGISTRADOS'],
      [''],
      ['📅 Fecha de Generación:', new Date().toLocaleDateString('es-ES')],
      ['🕐 Hora:', new Date().toLocaleTimeString('es-ES')],
      ['👥 Total de Usuarios:', props.users.length],
      [''],
      ['📋 DESCRIPCIÓN DEL REPORTE:'],
      ['Este documento contiene el reporte completo de usuarios registrados en GYMETRA.'],
      ['Incluye información detallada de perfiles, estados de cuenta y estadísticas.'],
      [''],
      ['📊 CONTENIDO:'],
      ['• Portada ejecutiva con información general'],
      ['• Datos completos de todos los usuarios'],
      ['• Estadísticas y análisis de distribución'],
      ['• Información generada automáticamente'],
      [''],
      ['🏢 GYMETRA - Sistema de Gestión de Gimnasios'],
      ['Versión del Sistema: 1.0'],
      ['Generado por: Panel de Administración']
    ]

    const wsCover = XLSX.utils.aoa_to_sheet(coverData)
    wsCover['!cols'] = [{ wch: 60 }]

    // === HOJA 2: DATOS DE USUARIOS CON ESTILOS ===
    const headers = [
      'ID Usuario',
      'Nombre Completo',
      'Correo Electrónico',
      'Teléfono',
      'N° Identificación',
      'Estado de Cuenta',
      'Fecha de Registro'
    ]

    const userRows = props.users.map((user, index) => [
      user.id || '',
      `${user.nombre || ''} ${user.apellido || ''}`.trim(),
      user.correo || '',
      user.telefono || 'N/A',
      user.identificacion || '',
      user.estado || '',
      formatDate(user.fechaCreacion) || ''
    ])

    // Agregar fila de totales
    userRows.push([''], ['TOTAL USUARIOS:', props.users.length, '', '', '', '', ''])

    const excelData = [headers, ...userRows]
    const wsData = XLSX.utils.aoa_to_sheet(excelData)

    // Configurar anchos de columna
    wsData['!cols'] = [
      { wch: 12 }, // ID Usuario
      { wch: 25 }, // Nombre Completo
      { wch: 30 }, // Correo
      { wch: 15 }, // Teléfono
      { wch: 18 }, // Identificación
      { wch: 15 }, // Estado
      { wch: 18 }  // Fecha
    ]

    // === HOJA 3: ESTADÍSTICAS CON GRÁFICOS ===
    const statsData = [
      ['📊 ESTADÍSTICAS DE USUARIOS GYMETRA'],
      [''],
      ['📈 MÉTRICAS GENERALES'],
      ['Total de Usuarios Registrados:', props.users.length],
      ['Usuarios Activos:', props.users.filter(u => u.estado === 'Activo').length],
      ['Usuarios Suspendidos:', props.users.filter(u => u.estado === 'Suspendido').length],
      ['Usuarios Vencidos:', props.users.filter(u => u.estado === 'Vencido').length],
      [''],
      ['📋 DISTRIBUCIÓN POR ESTADO DE CUENTA'],
      ['Estado', 'Cantidad', 'Porcentaje']
    ]

    // Calcular estadísticas detalladas
    const statusStats = props.users.reduce((acc, user) => {
      const status = user.estado || 'Sin Estado'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = ((count / props.users.length) * 100).toFixed(1)
      statsData.push([status, count, `${percentage}%`])
    })

    // Agregar información adicional
    statsData.push(
      [''],
      ['📅 INFORMACIÓN DEL REPORTE'],
      ['Fecha de Generación:', new Date().toLocaleString('es-ES')],
      ['Período del Reporte:', 'Todo el historial'],
      ['Sistema:', 'GYMETRA v1.0'],
      ['Tipo de Reporte:', 'Ejecutivo - Usuarios'],
      [''],
      ['🏆 RESUMEN EJECUTIVO'],
      [`GYMETRA cuenta actualmente con ${props.users.length} usuarios registrados.`],
      [`El ${((props.users.filter(u => u.estado === 'Activo').length / props.users.length) * 100).toFixed(1)}% de los usuarios están activos.`],
      ['Este reporte proporciona una visión completa del estado actual de la base de usuarios.']
    )

    const wsStats = XLSX.utils.aoa_to_sheet(statsData)
    wsStats['!cols'] = [
      { wch: 35 }, // Concepto
      { wch: 12 }, // Valor
      { wch: 12 }  // Porcentaje
    ]

    // === HOJA 4: RESUMEN VISUAL ===
    const summaryData = [
      ['🎯 RESUMEN VISUAL - USUARIOS GYMETRA'],
      [''],
      ['📊 NÚMEROS CLAVE'],
      [''],
      ['👥 TOTAL USUARIOS', props.users.length],
      ['✅ USUARIOS ACTIVOS', props.users.filter(u => u.estado === 'Activo').length],
      ['⏸️ USUARIOS SUSPENDIDOS', props.users.filter(u => u.estado === 'Suspendido').length],
      ['⚠️ USUARIOS VENCIDOS', props.users.filter(u => u.estado === 'Vencido').length],
      [''],
      ['📈 PORCENTAJES'],
      [''],
      ['Activos:', `${((props.users.filter(u => u.estado === 'Activo').length / props.users.length) * 100).toFixed(1)}%`],
      ['Suspendidos:', `${((props.users.filter(u => u.estado === 'Suspendido').length / props.users.length) * 100).toFixed(1)}%`],
      ['Vencidos:', `${((props.users.filter(u => u.estado === 'Vencido').length / props.users.length) * 100).toFixed(1)}%`],
      [''],
      ['📅 ÚLTIMA ACTUALIZACIÓN'],
      [new Date().toLocaleString('es-ES')],
      [''],
      ['🏢 GYMETRA - Sistema Integral de Gestión']
    ]

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }]

    // Agregar todas las hojas al libro
    XLSX.utils.book_append_sheet(wb, wsCover, '🏠 Portada')
    XLSX.utils.book_append_sheet(wb, wsData, '👥 Datos Usuarios')
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Estadísticas')
    XLSX.utils.book_append_sheet(wb, wsSummary, '🎯 Resumen')

    // Generar nombre del archivo con diseño
    const now = new Date()
    const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
    const fileName = `reporte_ejecutivo_gymetra_usuarios_${timestamp}.xlsx`

    // Descargar archivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('✅ Reporte Excel con diseño profesional generado exitosamente:', fileName)
    alert(`🎉 Reporte Ejecutivo Excel generado exitosamente!\n\n📁 Archivo: ${fileName}\n📊 4 hojas con diseño profesional incluido`)

  } catch (error) {
    console.error('❌ Error generando reporte Excel:', error)
    alert('Error al generar el reporte Excel. Verifique la consola para más detalles.')
  }
}

// Exportar pagos a Excel con diseño profesional
const exportPaymentsToExcel = async () => {
  try {
    console.log('💳 Generando reporte Excel profesional de pagos...')

    // Verificar que hay datos
    if (!props.payments || props.payments.length === 0) {
      alert('No hay pagos para exportar.')
      return
    }

<<<<<<< Updated upstream
    // Importar XLSX dinámicamente
    const XLSX = await import('xlsx')
=======
    // Importar XLSX dinámicamente con manejo de errores
    let XLSX
    try {
      XLSX = await import('xlsx')
    } catch (error) {
      console.error('xlsx no está instalado:', error)
      alert('La biblioteca xlsx no está instalada. Instale xlsx para generar reportes Excel.')
      return
    }
>>>>>>> Stashed changes

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()

    // === HOJA 1: PORTADA ===
    const coverData = [
      ['💳 GYMETRA - REPORTE EJECUTIVO'],
      [''],
      ['💰 HISTORIAL DE PAGOS'],
      [''],
      ['📅 Fecha de Generación:', new Date().toLocaleDateString('es-ES')],
      ['🕐 Hora:', new Date().toLocaleTimeString('es-ES')],
      ['💵 Total de Pagos:', props.payments.length],
      ['💰 Total Ingresos:', `$${props.payments.reduce((sum, p) => sum + p.costo, 0).toLocaleString('es-ES')}`],
      [''],
      ['📋 DESCRIPCIÓN DEL REPORTE:'],
      ['Este documento contiene el historial completo de pagos realizados en GYMETRA.'],
      ['Incluye información detallada de transacciones, usuarios y membresías.'],
      [''],
      ['📊 CONTENIDO:'],
      ['• Portada ejecutiva con métricas generales'],
      ['• Historial completo de pagos'],
      ['• Estadísticas financieras y análisis'],
      ['• Información generada automáticamente'],
      [''],
      ['🏢 GYMETRA - Sistema de Gestión de Gimnasios'],
      ['Versión del Sistema: 1.0'],
      ['Generado por: Panel de Administración']
    ]

    const wsCover = XLSX.utils.aoa_to_sheet(coverData)
    wsCover['!cols'] = [{ wch: 60 }]

    // === HOJA 2: HISTORIAL DE PAGOS ===
    const headers = [
      'ID Pago',
      'Usuario',
      'Fecha de Pago',
      'Monto',
      'Plan/Membresía',
      'Método de Pago',
      'Estado del Pago'
    ]

    const paymentRows = props.payments.map(payment => [
      payment.idPago,
      payment.identificacion,
      formatDate(payment.fechaPago),
      payment.costo,
      payment.plan,
      payment.metodoPago === 'GATEWAY' ? 'TARJETA DE CRÉDITO' : (payment.metodoPago || 'GATEWAY'),
      payment.estado
    ])

    // Agregar fila de totales
    const totalAmount = props.payments.reduce((sum, p) => sum + p.costo, 0)
    paymentRows.push([''], ['TOTAL INGRESOS:', '', totalAmount, '', '', ''])

    const excelData = [headers, ...paymentRows]
    const wsData = XLSX.utils.aoa_to_sheet(excelData)

    // Configurar anchos de columna
    wsData['!cols'] = [
      { wch: 15 }, // ID Pago
      { wch: 25 }, // Usuario
      { wch: 18 }, // Fecha
      { wch: 12 }, // Monto
      { wch: 20 }, // Plan
      { wch: 18 }, // Método
      { wch: 15 }  // Estado
    ]

    // === HOJA 3: ESTADÍSTICAS FINANCIERAS ===
    const statsData = [
      ['💰 ESTADÍSTICAS FINANCIERAS - PAGOS GYMETRA'],
      [''],
      ['📈 MÉTRICAS FINANCIERAS'],
      ['Total de Pagos Realizados:', props.payments.length],
      ['Total Ingresos Generados:', `$${totalAmount.toLocaleString('es-ES')}`],
      ['Pago Promedio:', `$${(totalAmount / props.payments.length).toFixed(2)}`],
      [''],
      ['📊 DISTRIBUCIÓN POR ESTADO DE PAGO'],
      ['Estado', 'Cantidad', 'Monto Total', 'Porcentaje']
    ]

    // Calcular estadísticas por estado
    const statusStats = props.payments.reduce((acc, payment) => {
      const status = payment.estado || 'Sin Estado'
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 }
      }
      acc[status].count++
      acc[status].amount += payment.costo
      return acc
    }, {} as Record<string, { count: number; amount: number }>)

    Object.entries(statusStats).forEach(([status, data]) => {
      const percentage = ((data.count / props.payments.length) * 100).toFixed(1)
      statsData.push([
        status,
        data.count,
        `$${data.amount.toLocaleString('es-ES')}`,
        `${percentage}%`
      ])
    })

    // Estadísticas por método de pago
    statsData.push([''], ['💳 DISTRIBUCIÓN POR MÉTODO DE PAGO'])
    const methodStats = props.payments.reduce((acc, payment) => {
      const method = payment.metodoPago === 'GATEWAY' ? 'TARJETA' : (payment.metodoPago || 'GATEWAY')
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(methodStats).forEach(([method, count]) => {
      statsData.push([method, count])
    })

    statsData.push([''], ['📅 INFORMACIÓN DEL REPORTE'])
    statsData.push(['Fecha de Generación:', new Date().toLocaleString('es-ES')])
    statsData.push(['Período del Reporte:', 'Todo el historial'])
    statsData.push(['Sistema:', 'GYMETRA v1.0'])
    statsData.push(['Tipo de Reporte:', 'Ejecutivo - Pagos'])

    const wsStats = XLSX.utils.aoa_to_sheet(statsData)
    wsStats['!cols'] = [
      { wch: 35 }, // Concepto
      { wch: 12 }, // Cantidad
      { wch: 15 }, // Monto
      { wch: 12 }  // Porcentaje
    ]

    // === HOJA 4: RESUMEN EJECUTIVO ===
    const summaryData = [
      ['🎯 RESUMEN EJECUTIVO - PAGOS GYMETRA'],
      [''],
      ['💰 NÚMEROS CLAVE'],
      [''],
      ['💵 TOTAL PAGOS', props.payments.length],
      ['💰 TOTAL INGRESOS', `$${totalAmount.toLocaleString('es-ES')}`],
      ['📊 PAGO PROMEDIO', `$${(totalAmount / props.payments.length).toFixed(2)}`],
      ['✅ PAGOS COMPLETADOS', props.payments.filter(p => p.estado === 'Completado').length],
      ['⏳ PAGOS PENDIENTES', props.payments.filter(p => p.estado === 'Pendiente').length],
      ['❌ PAGOS FALLIDOS', props.payments.filter(p => p.estado === 'Fallido').length],
      [''],
      ['📈 PORCENTAJES DE ÉXITO'],
      [''],
      ['Completados:', `${((props.payments.filter(p => p.estado === 'Completado').length / props.payments.length) * 100).toFixed(1)}%`],
      ['Pendientes:', `${((props.payments.filter(p => p.estado === 'Pendiente').length / props.payments.length) * 100).toFixed(1)}%`],
      ['Fallidos:', `${((props.payments.filter(p => p.estado === 'Fallido').length / props.payments.length) * 100).toFixed(1)}%`],
      [''],
      ['📅 ÚLTIMA ACTUALIZACIÓN'],
      [new Date().toLocaleString('es-ES')],
      [''],
      ['🏢 GYMETRA - Sistema Integral de Gestión']
    ]

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }]

    // Agregar todas las hojas al libro
    XLSX.utils.book_append_sheet(wb, wsCover, '🏠 Portada')
    XLSX.utils.book_append_sheet(wb, wsData, '💳 Historial Pagos')
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Estadísticas')
    XLSX.utils.book_append_sheet(wb, wsSummary, '🎯 Resumen')

    // Generar nombre del archivo profesional
    const now = new Date()
    const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
    const fileName = `reporte_ejecutivo_pagos_gymetra_${timestamp}.xlsx`

    // Descargar archivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log('✅ Reporte Excel de pagos generado exitosamente:', fileName)
    alert(`🎉 Reporte Ejecutivo Excel de Pagos generado exitosamente!\n\n📁 Archivo: ${fileName}\n💰 Total de pagos: ${props.payments.length}\n💵 Total ingresos: $${totalAmount.toLocaleString('es-ES')}`)

  } catch (error) {
    console.error('❌ Error generando reporte Excel de pagos:', error)
    alert('Error al generar el reporte Excel de pagos. Verifique la consola para más detalles.')
  }
}
</script>

<style scoped>
.generate-excel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #28a745;
  color: white;
}

.generate-excel-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.generate-excel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-excel-btn ion-icon {
  font-size: 16px;
}
</style>