// src/services/metricsService.ts
import axios from 'axios';

// URL base para métricas (usando proxy del admin frontend)
const METRICS_API_URL = '/membership-api';

// Interfaces para métricas
export interface MetricsData {
  // Usuarios
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Membresías
  totalMemberships: number;
  activeMemberships: number;
  expiredMemberships: number;
  suspendedMemberships: number;
  pendingMemberships: number;
  membershipDistribution: MembershipPlanMetrics[];

  // Pagos
  totalPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  paymentMethods: PaymentMethodMetrics[];
  revenueByPlan: RevenueByPlan[];

  // Estadísticas temporales
  userGrowth: TimeSeriesData[];
  revenueGrowth: TimeSeriesData[];
  membershipTrends: TimeSeriesData[];
  dailyActivity: DailyActivityData[];
}

export interface MembershipPlanMetrics {
  planName: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface PaymentMethodMetrics {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface RevenueByPlan {
  planName: string;
  revenue: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface DailyActivityData {
  hour: number;
  users: number;
  payments: number;
}

// ===============================
// Obtener métricas generales
// ===============================
export async function getMetricsData(): Promise<MetricsData> {
  try {
    console.log('📊 Cargando métricas del dashboard...');

    // Obtener datos de múltiples endpoints usando axios con manejo de errores individual
    const usersPromise = axios.get('/api/auth/users').catch(err => {
      console.warn('⚠️ Endpoint /api/auth/users no disponible:', err.message);
      return { data: [] };
    });

    const membershipsPromise = axios.get(`${METRICS_API_URL}/memberships`).catch(err => {
      console.warn('⚠️ Endpoint /memberships no disponible:', err.message);
      return { data: [] };
    });

    const paymentsPromise = axios.get(`${METRICS_API_URL}/payments/all`).catch(err => {
      console.warn('⚠️ Endpoint /payments/all no disponible:', err.message);
      return { data: [] };
    });

    const userMembershipsPromise = axios.get(`${METRICS_API_URL}/user-memberships/all`).catch(err => {
      console.warn('⚠️ Endpoint /user-memberships/all no disponible:', err.message);
      return { data: [] };
    });

    const [
      usersResponse,
      membershipsResponse,
      paymentsResponse,
      userMembershipsResponse
    ] = await Promise.all([
      usersPromise,
      membershipsPromise,
      paymentsPromise,
      userMembershipsPromise
    ]);

    // Procesar datos
    const users = usersResponse.data || [];
    const memberships = membershipsResponse.data || [];
    const payments = paymentsResponse.data || [];
    const userMemberships = userMembershipsResponse.data || [];

    console.log('✅ Datos obtenidos para métricas:', {
      users: users.length,
      memberships: memberships.length,
      payments: payments.length,
      userMemberships: userMemberships.length
    });

    // Debug: Mostrar estructura de datos
    if (users.length > 0) {
      console.log('👤 Ejemplo usuario:', users[0]);
    }
    if (payments.length > 0) {
      console.log('💰 Ejemplo pago:', payments[0]);
    }
    if (memberships.length > 0) {
      console.log('🏋️ Ejemplo membresía:', memberships[0]);
    }
    if (userMemberships.length > 0) {
      console.log('📋 Ejemplo userMembership:', userMemberships[0]);
      console.log('📋 Estructura userMembership:', {
        id: userMemberships[0].id,
        userId: userMemberships[0].userId,
        membershipId: userMemberships[0].membershipId,
        membership: userMemberships[0].membership,
        status: userMemberships[0].status
      });
    }

    // Calcular métricas
    const metrics = calculateMetrics(users, memberships, payments, userMemberships);

    return metrics;
  } catch (error: any) {
    console.error('❌ Error cargando métricas:', error);
    throw new Error(error.message || 'Error al cargar métricas del dashboard');
  }
}

// ===============================
// Calcular métricas desde datos crudos
// ===============================
function calculateMetrics(
  users: any[],
  memberships: any[],
  payments: any[],
  userMemberships: any[]
): MetricsData {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // === USUARIOS ===
  const totalUsers = users.length;
  const newUsersToday = users.filter(u => new Date(u.createdAt || u.registrationDate) >= today).length;
  const newUsersThisWeek = users.filter(u => new Date(u.createdAt || u.registrationDate) >= weekAgo).length;
  const newUsersThisMonth = users.filter(u => new Date(u.createdAt || u.registrationDate) >= monthAgo).length;

  // Usuarios activos y suspendidos (basado en AdminPage.vue)
  const activeUsers = users.filter(u => u.status === 'active' || u.estado === 'Activo').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended' || u.estado === 'Suspendido').length;

  console.log('👥 Usuarios procesados:', {
    total: totalUsers,
    active: activeUsers,
    suspended: suspendedUsers
  });

  // === MEMBRESÍAS ===
  const totalMemberships = userMemberships.length;
  const activeMemberships = userMemberships.filter(um => um.status === 'ACTIVE').length;
  const expiredMemberships = userMemberships.filter(um => um.status === 'EXPIRED').length;
  const suspendedMemberships = userMemberships.filter(um => um.status === 'SUSPENDED').length;
  const pendingMemberships = userMemberships.filter(um => um.status === 'PENDING').length;

  // Distribución por plan
  const membershipDistribution = calculateMembershipDistribution(userMemberships, memberships);

  // === PAGOS ===
  const totalPayments = payments.length;
  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'CONFIRMED')
    .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);

  const monthlyRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
      return paymentDate >= monthAgo && (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'CONFIRMED');
    })
    .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);

  const weeklyRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
      return paymentDate >= weekAgo && (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'CONFIRMED');
    })
    .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);

  const dailyRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
      return paymentDate >= today && (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'CONFIRMED');
    })
    .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);

  console.log('💰 Pagos procesados:', {
    total: totalPayments,
    totalRevenue: totalRevenue,
    monthlyRevenue: monthlyRevenue,
    dailyRevenue: dailyRevenue
  });

  // Métodos de pago
  const paymentMethods = calculatePaymentMethods(payments);

  // Ingresos por plan
  const revenueByPlan = calculateRevenueByPlan(payments, memberships);

  // === DATOS TEMPORALES ===
  const userGrowth = calculateUserGrowth(users, 30);
  const revenueGrowth = calculateRevenueGrowth(payments, 30);
  const membershipTrends = calculateMembershipTrends(userMemberships, 30);
  const dailyActivity = calculateDailyActivity(payments, users);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    totalMemberships,
    activeMemberships,
    expiredMemberships,
    suspendedMemberships,
    pendingMemberships,
    membershipDistribution,
    totalPayments,
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    dailyRevenue,
    paymentMethods,
    revenueByPlan,
    userGrowth,
    revenueGrowth,
    membershipTrends,
    dailyActivity
  };
}

// ===============================
// Funciones auxiliares de cálculo
// ===============================

function calculateMembershipDistribution(userMemberships: any[], memberships: any[]): MembershipPlanMetrics[] {
  const planCount = new Map<string, number>();
  const planRevenue = new Map<string, number>();

  userMemberships.forEach(um => {
    let planName = 'Desconocido';
    
    // Intentar obtener el nombre del plan de diferentes formas
    // 1. Si el objeto membership está incluido en la respuesta
    if (um.membership && um.membership.planName) {
      planName = um.membership.planName;
    }
    // 2. Si hay un membershipId directo
    else if (um.membershipId) {
      const membership = memberships.find(m => m.membershipId === um.membershipId);
      if (membership && membership.planName) {
        planName = membership.planName;
      }
    }
    // 3. Si hay un membership.membershipId (objeto anidado con solo el ID)
    else if (um.membership && um.membership.membershipId) {
      const membership = memberships.find(m => m.membershipId === um.membership.membershipId);
      if (membership && membership.planName) {
        planName = membership.planName;
      }
    }
    
    // Log para debugging
    if (planName === 'Desconocido') {
      console.warn('⚠️ No se pudo encontrar el plan para userMembership:', {
        id: um.id,
        userId: um.userId,
        membershipId: um.membershipId,
        membership: um.membership,
        availableMemberships: memberships.map(m => ({ id: m.membershipId, name: m.planName }))
      });
    }
    
    planCount.set(planName, (planCount.get(planName) || 0) + 1);
  });

  const total = userMemberships.length;
  return Array.from(planCount.entries())
    .map(([planName, count]) => ({
      planName,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      revenue: 0 // Se calcula después con pagos
    }))
    .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente
}

function calculateRevenueByPeriod(payments: any[], days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
      return paymentDate >= cutoff &&
             (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS');
    })
    .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);
}

function calculatePaymentMethods(payments: any[]): PaymentMethodMetrics[] {
  const methodCount = new Map<string, { count: number; total: number }>();

  payments
    .filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS')
    .forEach(p => {
      const method = p.paymentMethod || p.metodoPago || 'GATEWAY';
      const amount = p.amount || p.monto || 0;

      if (!methodCount.has(method)) {
        methodCount.set(method, { count: 0, total: 0 });
      }

      const current = methodCount.get(method)!;
      current.count++;
      current.total += amount;
    });

  const totalPayments = payments.filter(p =>
    p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS'
  ).length;

  return Array.from(methodCount.entries()).map(([method, data]) => ({
    method: method === 'GATEWAY' ? 'TARJETA' : method,
    count: data.count,
    percentage: totalPayments > 0 ? Math.round((data.count / totalPayments) * 100) : 0,
    totalAmount: data.total
  }));
}

function calculateRevenueByPlan(payments: any[], memberships: any[]): RevenueByPlan[] {
  const planRevenue = new Map<string, number>();

  payments
    .filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS')
    .forEach(p => {
      // Intentar encontrar el plan por membershipId o planId
      const membershipId = p.membershipId || p.planId;
      const plan = memberships.find(m => m.membershipId === membershipId);
      const planName = plan?.planName || 'Desconocido';

      planRevenue.set(planName, (planRevenue.get(planName) || 0) + (p.amount || p.monto || 0));
    });

  const totalRevenue = Array.from(planRevenue.values()).reduce((sum, rev) => sum + rev, 0);

  return Array.from(planRevenue.entries())
    .map(([planName, revenue]) => ({
      planName,
      revenue,
      percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function calculateUserGrowth(users: any[], days: number): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const count = users.filter(u => {
      const userDate = new Date(u.createdAt || u.registrationDate);
      return userDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({
      date: dateStr,
      value: count,
      label: date.toLocaleDateString('es-ES', { weekday: 'short' })
    });
  }

  return result;
}

function calculateRevenueGrowth(payments: any[], days: number): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const revenue = payments
      .filter(p => {
        const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
        return paymentDate.toISOString().split('T')[0] === dateStr &&
               (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS');
      })
      .reduce((sum, p) => sum + (p.amount || p.monto || 0), 0);

    result.push({
      date: dateStr,
      value: revenue,
      label: date.toLocaleDateString('es-ES', { weekday: 'short' })
    });
  }

  return result;
}

function calculateMembershipTrends(userMemberships: any[], days: number): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const count = userMemberships.filter(um => {
      const membershipDate = new Date(um.createdAt || um.startDate);
      return membershipDate.toISOString().split('T')[0] === dateStr;
    }).length;

    result.push({
      date: dateStr,
      value: count,
      label: date.toLocaleDateString('es-ES', { weekday: 'short' })
    });
  }

  return result;
}

function calculateDailyActivity(payments: any[], users: any[]): DailyActivityData[] {
  const hourlyData = new Array(24).fill(null).map((_, hour) => ({
    hour,
    users: 0,
    payments: 0
  }));

  // Contar usuarios por hora (últimas 24 horas)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  users
    .filter(u => new Date(u.createdAt || u.registrationDate) >= last24Hours)
    .forEach(u => {
      const hour = new Date(u.createdAt || u.registrationDate).getHours();
      hourlyData[hour].users++;
    });

  // Contar pagos por hora (últimas 24 horas)
  payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate || p.fechaPago || p.createdAt);
      return paymentDate >= last24Hours &&
             (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS');
    })
    .forEach(p => {
      const hour = new Date(p.paymentDate || p.fechaPago || p.createdAt).getHours();
      hourlyData[hour].payments++;
    });

  return hourlyData;
}

// ===============================
// Formatear números para display
// ===============================
export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  
  // Redondear a 2 decimales máximo
  const rounded = Math.round(num * 100) / 100;
  
  // Separar parte entera y decimal
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // Formatear parte entera con puntos cada 3 dígitos
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Si hay decimales, agregarlos (máximo 2)
  if (decimalPart) {
    const formattedDecimal = decimalPart.substring(0, 2);
    return `${formattedInteger},${formattedDecimal}`;
  }
  
  return formattedInteger;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0';
  return `$${formatNumber(amount)}`;
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}