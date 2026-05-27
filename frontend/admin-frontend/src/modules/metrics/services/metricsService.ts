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
    // Obtener datos de múltiples endpoints usando axios con manejo de errores individual
    const usersPromise = axios.get('/api/auth/users').catch(() => ({ data: [] }));
    const membershipsPromise = axios.get(`${METRICS_API_URL}/memberships`).catch(() => ({ data: [] }));
    const paymentsPromise = axios.get(`${METRICS_API_URL}/payments/all`).catch(() => ({ data: [] }));
    const userMembershipsPromise = axios.get(`${METRICS_API_URL}/user-memberships/all`).catch(() => ({ data: [] }));

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

    // Calcular métricas
    const metrics = calculateMetrics(users, memberships, payments, userMemberships);

    return metrics;
  } catch (error: any) {
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
    const planName = memberships.find(m => m.membershipId === um.membershipId)?.planName || 'Desconocido';
    planCount.set(planName, (planCount.get(planName) || 0) + 1);
  });

  const total = userMemberships.length;
  return Array.from(planCount.entries()).map(([planName, count]) => ({
    planName,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    revenue: 0 // Se calcula después con pagos
  }));
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

function calculateTimeSeriesData(
  items: any[],
  days: number,
  getDate: (item: any) => string | undefined,
  getValue: (itemsForDay: any[]) => number
): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const itemsForDay = items.filter(item => {
      const itemDateVal = getDate(item);
      if (!itemDateVal) return false;
      const itemDate = new Date(itemDateVal);
      return itemDate.toISOString().split('T')[0] === dateStr;
    });

    result.push({
      date: dateStr,
      value: getValue(itemsForDay),
      label: date.toLocaleDateString('es-ES', { weekday: 'short' })
    });
  }

  return result;
}

function calculateUserGrowth(users: any[], days: number): TimeSeriesData[] {
  return calculateTimeSeriesData(
    users,
    days,
    u => u.createdAt || u.registrationDate,
    items => items.length
  );
}

function calculateRevenueGrowth(payments: any[], days: number): TimeSeriesData[] {
  return calculateTimeSeriesData(
    payments.filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS' || p.paymentStatus === 'CONFIRMED'),
    days,
    p => p.paymentDate || p.fechaPago || p.createdAt,
    items => items.reduce((sum, p) => sum + (p.amount || p.monto || 0), 0)
  );
}

function calculateMembershipTrends(userMemberships: any[], days: number): TimeSeriesData[] {
  return calculateTimeSeriesData(
    userMemberships,
    days,
    um => um.createdAt || um.startDate,
    items => items.length
  );
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
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(amount: number): string {
  return `$${formatNumber(amount)}`;
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}
