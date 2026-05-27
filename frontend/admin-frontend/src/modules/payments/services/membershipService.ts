import axios from 'axios';
import { MEMBERSHIP_API_URL } from '../../shared/services/apiService';
export interface Membership {
  membershipId: number;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  status: string;
  training: boolean;
  nutrition: boolean;
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
    return (await axios.get(`${MEMBERSHIP_API_URL}/memberships`)).data;
  },

  async getAllUserMemberships(): Promise<UserMembership[]> {
    const response = await axios.get(`${MEMBERSHIP_API_URL}/user-memberships/all`);
    return response.data;
  },

  async getAllPayments(): Promise<Payment[]> {
    return (await axios.get(`${MEMBERSHIP_API_URL}/payments/all`)).data;
  },

  async createMembership(membership: Omit<Membership, 'membershipId'>): Promise<Membership> {
    return (await axios.post(`${MEMBERSHIP_API_URL}/memberships`, membership)).data;
  },

  async updateMembership(id: number, updates: Partial<Membership>): Promise<Membership> {
    return (await axios.put(`${MEMBERSHIP_API_URL}/memberships/${id}`, updates)).data;
  },

  async deleteMembership(id: number): Promise<void> {
    await axios.delete(`${MEMBERSHIP_API_URL}/memberships/${id}`);
  }
};
