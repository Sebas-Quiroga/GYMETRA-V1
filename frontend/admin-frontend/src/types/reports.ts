export interface User {
  id?: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
  identificacion: number
  estado: 'Activo' | 'Vencido' | 'Suspendido'
  fechaCreacion: Date | string
}

export interface Payment {
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
