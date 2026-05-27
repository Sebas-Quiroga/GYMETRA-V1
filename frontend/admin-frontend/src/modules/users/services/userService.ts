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
    return (await axios.get(`${API_BASE_URL}/users`)).data;
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
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating user'
      };
    }
  },

  async deleteUser(userId: number): Promise<boolean> {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.status === 200;
  },

  async getRoles(): Promise<Role[]> {
    return (await axios.get('/api/roles')).data;
  },

  async createRole(roleData: RoleRequest): Promise<RoleResponse> {
    return (await axios.post('/api/roles', roleData)).data;
  },

  async getRoleById(roleId: number): Promise<RoleResponse> {
    return (await axios.get(`/api/roles/${roleId}`)).data;
  },

  async updateRole(roleId: number, roleData: RoleRequest): Promise<RoleResponse> {
    return (await axios.put(`/api/roles/${roleId}`, roleData)).data;
  },

  async deleteRole(roleId: number): Promise<boolean> {
    const response = await axios.delete(`/api/roles/${roleId}`);
    return response.status === 200;
  },

  async updateUserStatus(userId: number, status: 'active' | 'suspended'): Promise<boolean> {
    const response = await axios.patch(`/api/auth/users/${userId}/status?status=${status}`);
    return response.status === 200;
  },

  async syncUsersFromCognito(): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/sync`);
      return response.data;
    } catch (error: any) {
      return error.response?.data?.message || 'Error (500): Fallo de configuración o credenciales en el backend al intentar contactar a AWS Cognito.';
    }
  }
};
