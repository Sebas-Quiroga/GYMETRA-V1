<template>
  <button class="generate-pdf-btn" @click="exportToPDF" :disabled="loading">
    <ion-icon :icon="documentTextOutline"></ion-icon>
    PDF
  </button>
</template>

<script setup lang="ts">
import { documentTextOutline } from 'ionicons/icons'

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

// Función auxiliar para agregar encabezado de página
const addPageHeader = (doc: any, title: string, primaryColor: number[], darkGrayColor: number[]) => {
  // Fondo del encabezado
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 25, 'F')

  // Logo pequeño
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('GYMETRA', 20, 15)

  // Título de la página
  doc.setFontSize(14)
  doc.text(title, 105, 15, { align: 'center' })

  // Fecha
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('es-ES'), 180, 15)

  // Línea divisoria
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(1)
  doc.line(0, 25, 210, 25)
}

// Función auxiliar para agregar pie de página
const addPageFooter = (doc: any, pageNumber: number) => {
  const primaryColor = [33, 150, 243]
  const darkGrayColor = [44, 62, 80]

  // Línea divisoria superior
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(0.5)
  doc.line(0, 280, 210, 280)

  // Información del pie
  doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Gestión GYMETRA v1.0 - Reporte Ejecutivo', 20, 290)
  doc.text(`Página ${pageNumber}`, 180, 290, { align: 'right' })
}

// Exportar a PDF
const exportToPDF = async () => {
  if (props.type === 'users') {
    await exportUsersToPDF()
  } else if (props.type === 'payments') {
    await exportPaymentsToPDF()
  }
}

// Exportar usuarios a PDF con diseño profesional
const exportUsersToPDF = async () => {
  try {
    console.log('📄 Generando reporte PDF profesional de usuarios...')

    // Verificar que hay datos
    if (!props.users || props.users.length === 0) {
      alert('No hay usuarios para exportar.')
      return
    }

    // Importar jsPDF
    const { jsPDF } = await import('jspdf')

    // Crear documento PDF
    const doc = new jsPDF()

    // Configurar fuente por defecto
    doc.setFont('helvetica', 'normal')

    // Configurar colores corporativos
    const primaryColor = [33, 150, 243] // Azul GYMETRA
    const secondaryColor = [76, 175, 80] // Verde éxito
    const accentColor = [255, 152, 0] // Naranja
    const grayColor = [149, 165, 166] // Gris
    const darkGrayColor = [44, 62, 80] // Gris oscuro

    // === PORTADA ===
    // Fondo degradado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 297, 'F')

    // Elementos decorativos
    doc.setFillColor(255, 255, 255, 0.1)
    doc.rect(20, 50, 170, 200, 'F')

    // Logo/Brand
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text('GYMETRA', 105, 90, { align: 'center' })

    // Línea decorativa
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.line(70, 110, 140, 110)

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.text('REPORTE EJECUTIVO', 105, 130, { align: 'center' })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('USUARIOS REGISTRADOS', 105, 150, { align: 'center' })

    // Información del reporte en caja
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1)
    doc.roundedRect(30, 170, 150, 60, 5, 5, 'FD')

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DEL REPORTE', 105, 185, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 40, 200)
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, 40, 210)
    doc.text(`Total de Usuarios: ${props.users.length}`, 40, 220)

    // Branding
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255, 0.8)
    doc.text('Sistema de Gestión GYMETRA v1.0 - Panel de Administración', 105, 280, { align: 'center' })

    // === PÁGINA 2: ÍNDICE ===
    doc.addPage()

    // Encabezado de página
    addPageHeader(doc, 'ÍNDICE EJECUTIVO', primaryColor, darkGrayColor)

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTENIDO DEL REPORTE', 20, 50)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('1. Resumen Ejecutivo', 25, 70)
    doc.text('2. Estadísticas Generales', 25, 85)
    doc.text('3. Listado Completo de Usuarios', 25, 100)
    doc.text('4. Análisis por Estado', 25, 115)

    // Pie de página
    addPageFooter(doc, 1)

    // === PÁGINA 3: RESUMEN EJECUTIVO ===
    doc.addPage()

    addPageHeader(doc, 'RESUMEN EJECUTIVO', primaryColor, darkGrayColor)

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('VISIÓN GENERAL', 20, 50)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const summaryText = `Este reporte presenta un análisis completo de los usuarios registrados en el sistema GYMETRA. Actualmente, la plataforma cuenta con ${props.users.length} usuarios activos, lo que representa la base de usuarios total del sistema.`
    const splitSummary = doc.splitTextToSize(summaryText, 170)
    doc.text(splitSummary, 20, 65)

    // Estadísticas en cajas
    const statsY = 100
    const boxWidth = 80
    const boxHeight = 25

    // Caja 1: Total Usuarios
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(20, statsY, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL USUARIOS', 60, statsY + 8, { align: 'center' })
    doc.setFontSize(16)
    doc.text(props.users.length.toString(), 60, statsY + 18, { align: 'center' })

    // Caja 2: Usuarios Activos
    const activeUsers = props.users.filter(u => u.estado === 'Activo').length
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.roundedRect(110, statsY, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('USUARIOS ACTIVOS', 150, statsY + 6, { align: 'center' })
    doc.setFontSize(14)
    doc.text(activeUsers.toString(), 150, statsY + 18, { align: 'center' })

    addPageFooter(doc, 2)

    // === PÁGINA 4: LISTADO DE USUARIOS ===
    doc.addPage()

    addPageHeader(doc, 'USUARIOS REGISTRADOS', primaryColor, darkGrayColor)

    let yPosition = 50

    // Encabezados de tabla
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(20, yPosition - 5, 170, 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('ID', 25, yPosition)
    doc.text('NOMBRE COMPLETO', 45, yPosition)
    doc.text('CORREO', 105, yPosition)
    doc.text('ESTADO', 165, yPosition)

    yPosition += 15

    // Línea divisoria
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(20, yPosition - 2, 190, yPosition - 2)

    // Datos de usuarios
    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    props.users.forEach((user, index) => {
      if (yPosition > 260) {
        addPageFooter(doc, Math.ceil((index + 1) / 25) + 3)
        doc.addPage()
        addPageHeader(doc, 'USUARIOS REGISTRADOS (continuación)', primaryColor, darkGrayColor)
        yPosition = 50
      }

      const fullName = `${user.nombre || ''} ${user.apellido || ''}`.trim()
      const status = user.estado || 'N/A'

      // Fila alterna
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250)
        doc.rect(20, yPosition - 3, 170, 8, 'F')
      }

      doc.text(user.id?.toString() || '', 25, yPosition)
      doc.text(fullName.substring(0, 25), 45, yPosition)
      doc.text((user.correo || '').substring(0, 25), 105, yPosition)
      doc.text(status, 165, yPosition)

      yPosition += 8
    })

    // Línea final
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.line(20, yPosition, 190, yPosition)

    addPageFooter(doc, 4)

    // Generar nombre del archivo
    const now = new Date()
    const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
    const fileName = `reporte_ejecutivo_usuarios_gymetra_${timestamp}.pdf`

    // Descargar archivo
    doc.save(fileName)

    console.log('✅ Reporte PDF profesional de usuarios generado exitosamente:', fileName)
    alert(`📄 Reporte PDF Ejecutivo generado exitosamente!\n\n📁 Archivo: ${fileName}\n👥 Total de usuarios: ${props.users.length}\n📊 Diseño profesional incluido`)

  } catch (error) {
    console.error('❌ Error generando reporte PDF:', error)
    alert('Error al generar el reporte PDF. Verifique la consola para más detalles.')
  }
}

// Exportar pagos a PDF con diseño profesional
const exportPaymentsToPDF = async () => {
  try {
    console.log('💰 Generando reporte PDF profesional de pagos...')

    // Verificar que hay datos
    if (!props.payments || props.payments.length === 0) {
      alert('No hay pagos para exportar.')
      return
    }

    // Importar jsPDF
    const { jsPDF } = await import('jspdf')

    // Crear documento PDF
    const doc = new jsPDF()

    // Configurar fuente por defecto
    doc.setFont('helvetica', 'normal')

    // Configurar colores corporativos
    const primaryColor = [33, 150, 243] // Azul GYMETRA
    const secondaryColor = [76, 175, 80] // Verde éxito
    const accentColor = [255, 152, 0] // Naranja
    const grayColor = [149, 165, 166] // Gris
    const darkGrayColor = [44, 62, 80] // Gris oscuro

    const totalAmount = props.payments.reduce((sum, p) => sum + p.costo, 0)

    // === PORTADA ===
    // Fondo degradado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 297, 'F')

    // Elementos decorativos
    doc.setFillColor(255, 255, 255, 0.1)
    doc.rect(20, 50, 170, 200, 'F')

    // Logo/Brand
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text('GYMETRA', 105, 90, { align: 'center' })

    // Línea decorativa
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.line(70, 110, 140, 110)

    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.text('REPORTE EJECUTIVO', 105, 130, { align: 'center' })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('HISTORIAL DE PAGOS', 105, 150, { align: 'center' })

    // Información del reporte en caja
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1)
    doc.roundedRect(30, 170, 150, 70, 5, 5, 'FD')

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN DEL REPORTE', 105, 185, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 40, 200)
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, 40, 210)
    doc.text(`Total de Pagos: ${props.payments.length}`, 40, 220)
    doc.text(`Total Ingresos: $${totalAmount.toLocaleString('es-ES')}`, 40, 230)

    // Branding
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255, 0.8)
    doc.text('Sistema de Gestión GYMETRA v1.0 - Panel de Administración', 105, 280, { align: 'center' })

    // === PÁGINA 2: ÍNDICE ===
    doc.addPage()

    addPageHeader(doc, 'ÍNDICE EJECUTIVO', primaryColor, darkGrayColor)

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTENIDO DEL REPORTE', 20, 50)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('1. Resumen Ejecutivo Financiero', 25, 70)
    doc.text('2. Estadísticas de Ingresos', 25, 85)
    doc.text('3. Historial Completo de Pagos', 25, 100)
    doc.text('4. Análisis por Método de Pago', 25, 115)

    addPageFooter(doc, 1)

    // === PÁGINA 3: RESUMEN EJECUTIVO ===
    doc.addPage()

    addPageHeader(doc, 'RESUMEN EJECUTIVO FINANCIERO', primaryColor, darkGrayColor)

    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('VISIÓN GENERAL FINANCIERA', 20, 50)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const summaryText = `Este reporte presenta un análisis completo del historial de pagos en GYMETRA. Se han procesado ${props.payments.length} transacciones exitosas, generando un total de $${totalAmount.toLocaleString('es-ES')} en ingresos.`
    const splitSummary = doc.splitTextToSize(summaryText, 170)
    doc.text(splitSummary, 20, 65)

    // Estadísticas en cajas
    const statsY = 100
    const boxWidth = 80
    const boxHeight = 25

    // Caja 1: Total Pagos
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(20, statsY, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL PAGOS', 60, statsY + 6, { align: 'center' })
    doc.setFontSize(14)
    doc.text(props.payments.length.toString(), 60, statsY + 18, { align: 'center' })

    // Caja 2: Total Ingresos
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.roundedRect(110, statsY, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL INGRESOS', 150, statsY + 6, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`$${totalAmount.toLocaleString('es-ES')}`, 150, statsY + 18, { align: 'center' })

    // Caja 3: Pago Promedio
    const avgPayment = totalAmount / props.payments.length
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.roundedRect(20, statsY + 35, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGO PROMEDIO', 60, statsY + 41, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`$${avgPayment.toFixed(0)}`, 60, statsY + 53, { align: 'center' })

    // Caja 4: Pagos Exitosos
    const successfulPayments = props.payments.filter(p => p.estado === 'Completado').length
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.roundedRect(110, statsY + 35, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGOS EXITOSOS', 150, statsY + 41, { align: 'center' })
    doc.setFontSize(14)
    doc.text(successfulPayments.toString(), 150, statsY + 53, { align: 'center' })

    addPageFooter(doc, 2)

    // === PÁGINA 4: HISTORIAL DE PAGOS ===
    doc.addPage()

    addPageHeader(doc, 'HISTORIAL DE PAGOS', primaryColor, darkGrayColor)

    let yPosition = 50

    // Encabezados de tabla
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(20, yPosition - 5, 170, 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('ID PAGO', 25, yPosition)
    doc.text('USUARIO', 55, yPosition)
    doc.text('FECHA', 105, yPosition)
    doc.text('MONTO', 135, yPosition)
    doc.text('ESTADO', 165, yPosition)

    yPosition += 15

    // Línea divisoria
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(20, yPosition - 2, 190, yPosition - 2)

    // Datos de pagos
    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2])
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)

    props.payments.forEach((payment, index) => {
      if (yPosition > 260) {
        addPageFooter(doc, Math.ceil((index + 1) / 20) + 3)
        doc.addPage()
        addPageHeader(doc, 'HISTORIAL DE PAGOS (continuación)', primaryColor, darkGrayColor)
        yPosition = 50
      }

      // Fila alterna
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250)
        doc.rect(20, yPosition - 3, 170, 7, 'F')
      }

      doc.text(payment.idPago.toString(), 25, yPosition)
      doc.text(payment.identificacion.substring(0, 18), 55, yPosition)
      doc.text(formatDate(payment.fechaPago).split(' ')[0], 105, yPosition)
      doc.text(`$${payment.costo.toLocaleString('es-ES')}`, 135, yPosition)
      doc.text(payment.estado, 165, yPosition)

      yPosition += 7
    })

    // Línea final y totales
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.line(20, yPosition, 190, yPosition)

    yPosition += 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`TOTAL PAGOS: ${props.payments.length}`, 20, yPosition)
    doc.text(`TOTAL INGRESOS: $${totalAmount.toLocaleString('es-ES')}`, 20, yPosition + 8)

    addPageFooter(doc, 4)

    // Generar nombre del archivo
    const now = new Date()
    const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
    const fileName = `reporte_ejecutivo_pagos_gymetra_${timestamp}.pdf`

    // Descargar archivo
    doc.save(fileName)

    console.log('✅ Reporte PDF profesional de pagos generado exitosamente:', fileName)
    alert(`📄 Reporte PDF Ejecutivo generado exitosamente!\n\n📁 Archivo: ${fileName}\n💰 Total de pagos: ${props.payments.length}\n💵 Total ingresos: $${totalAmount.toLocaleString('es-ES')}\n📊 Diseño profesional incluido`)

  } catch (error) {
    console.error('❌ Error generando reporte PDF:', error)
    alert('Error al generar el reporte PDF. Verifique la consola para más detalles.')
  }
}
</script>

<style scoped>
.generate-pdf-btn {
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
  background: #dc3545;
  color: white;
}

.generate-pdf-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.generate-pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-pdf-btn ion-icon {
  font-size: 16px;
}
</style>