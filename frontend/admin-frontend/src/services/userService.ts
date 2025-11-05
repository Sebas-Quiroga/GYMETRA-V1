import axios from 'axios';

const API_BASE_URL = '/api/auth'; // Usar proxy de Vite

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identification: number;
  status: string;
  photoUrl?: string;
  createdAt: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};