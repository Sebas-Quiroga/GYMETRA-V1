import axios from 'axios';
import { LOGIN_API_URL } from '../../shared/services/apiService';

const API_BASE_URL = `${LOGIN_API_URL}/auth`;

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

export interface UserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  identification?: number;
  password?: string;
  roleId?: number;
}

export interface UserMutationResponse {
  success: boolean;
  message?: string;
  user?: User;
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

  async createUser(userData: UserRequest): Promise<UserMutationResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return {
        success: response.status >= 200 && response.status < 300,
        message: response.data?.message,
        user: response.data?.user || response.data
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error creating user'
      };
    }
  },

  async updateUser(userId: number, userData: UserRequest): Promise<UserMutationResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
      return {
        success: response.status >= 200 && response.status < 300,
        message: response.data?.message,
        user: response.data?.user || response.data
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating user'
      };
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
  },

  async syncUsersFromCognito(): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/sync`);
      return response.data;
    } catch (error) {
      console.error('Error syncing users from Cognito:', error);
      throw error;
    }
  }
};
