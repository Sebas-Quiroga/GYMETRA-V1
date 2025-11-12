import axios from 'axios';

const MEMBERSHIP_API_URL = '/membership-api'; // Usar proxy específico para backend de membresías

export interface Membership {
  membershipId: number;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  status: string;
  userMemberships?: UserMembership[];
}

export interface UserMembership {
  id: number;
  userId: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED' | 'EXPIRED' | 'PENDING';
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface Payment {
  id: number;
  userMembership: UserMembership;
  paymentDate: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'GATEWAY';
  transactionReference?: string;
  paymentStatus: string; // Cambiado a string para manejar cualquier valor del backend
  createdAt: string;
}

export const membershipService = {
  async getAllMemberships(): Promise<Membership[]> {
    try {
      // Para admin, obtener TODAS las membresías (no solo las disponibles)
      const response = await axios.get(`${MEMBERSHIP_API_URL}/memberships`);
      return response.data;
    } catch (error) {
      console.error('Error fetching memberships:', error);
      throw error;
    }
  },

  async getAllUserMemberships(): Promise<UserMembership[]> {
    try {
      const response = await axios.get(`${MEMBERSHIP_API_URL}/memberships/available`);
      return response.data.flatMap((membership: Membership) => membership.userMemberships || []);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      throw error;
    }
  },

  async getAllPayments(): Promise<Payment[]> {
    try {
      const response = await axios.get(`${MEMBERSHIP_API_URL}/payments/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async createMembership(membership: Omit<Membership, 'membershipId'>): Promise<Membership> {
    try {
      const response = await axios.post(`${MEMBERSHIP_API_URL}/memberships`, membership);
      return response.data;
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  },

  async updateMembership(id: number, updates: Partial<Membership>): Promise<Membership> {
    try {
      const response = await axios.put(`${MEMBERSHIP_API_URL}/memberships/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  },

  async deleteMembership(id: number): Promise<void> {
    try {
      await axios.delete(`${MEMBERSHIP_API_URL}/memberships/${id}`);
    } catch (error) {
      console.error('Error deleting membership:', error);
      throw error;
    }
  }
};