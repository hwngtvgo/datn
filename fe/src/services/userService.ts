import axios from 'axios';
import { API_URL } from '../config/constants';
import authService from './authService';

// Định nghĩa các interfaces sử dụng trong service
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Service quản lý người dùng
class UserService {
  // Lấy danh sách tất cả người dùng
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      const response = await axios.get<UserResponse[]>(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  }

  // Lấy thông tin người dùng theo ID
  async getUserById(id: number): Promise<UserResponse> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      const response = await axios.get<UserResponse>(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng với ID ${id}:`, error);
      throw error;
    }
  }

  // Tạo người dùng mới
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      const response = await axios.post<UserResponse>(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      const response = await axios.put<UserResponse>(`${API_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng với ID ${id}:`, error);
      throw error;
    }
  }

  // Cập nhật mật khẩu người dùng
  async updatePassword(id: number, passwordData: UpdatePasswordRequest): Promise<void> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      await axios.put(`${API_URL}/users/${id}/password`, passwordData);
    } catch (error) {
      console.error(`Lỗi khi cập nhật mật khẩu cho người dùng với ID ${id}:`, error);
      throw error;
    }
  }

  // Xóa người dùng
  async deleteUser(id: number): Promise<void> {
    try {
      // Đảm bảo header xác thực được thiết lập
      const token = authService.getCurrentUser()?.accessToken;
      if (token) {
        authService.setAuthHeader(token);
      }
      
      await axios.delete(`${API_URL}/users/${id}`);
    } catch (error) {
      console.error(`Lỗi khi xóa người dùng với ID ${id}:`, error);
      throw error;
    }
  }
}

export default new UserService(); 