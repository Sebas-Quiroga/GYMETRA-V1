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
  role?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface RoleRequest {
  roleName: string;
}

export interface RoleResponse {
  roleId: number;
  roleName: string;
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
  },

  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get('/api/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  async createRole(roleData: RoleRequest): Promise<RoleResponse> {
    try {
      const response = await axios.post('/api/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  async getRoleById(roleId: number): Promise<RoleResponse> {
    try {
      const response = await axios.get(`/api/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  async updateRole(roleId: number, roleData: RoleRequest): Promise<RoleResponse> {
    try {
      const response = await axios.put(`/api/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  async deleteRole(roleId: number): Promise<boolean> {
    try {
      const response = await axios.delete(`/api/roles/${roleId}`);
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: number, status: 'active' | 'suspended'): Promise<boolean> {
    try {
      const response = await axios.patch(`/api/auth/users/${userId}/status?status=${status}`);
      return response.status === 200;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
};