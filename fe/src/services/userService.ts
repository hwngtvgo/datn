import axios from 'axios';
import { API_URL } from '../config/constants';
import authModule from '../modules/auth';

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
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Service quản lý người dùng
class UserService {
  // Lấy danh sách tất cả người dùng
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const response = await axios.get<UserResponse[]>(`${API_URL}/users`, authModule.createAuthConfig());
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  }

  // Lấy thông tin người dùng theo ID
  async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await axios.get<UserResponse>(`${API_URL}/users/${id}`, authModule.createAuthConfig());
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng với ID ${id}:`, error);
      throw error;
    }
  }

  // Tạo người dùng mới
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      const response = await axios.post<UserResponse>(`${API_URL}/users`, userData, authModule.createAuthConfig());
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    try {
      const response = await axios.put<UserResponse>(`${API_URL}/users/${id}`, userData, authModule.createAuthConfig());
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng với ID ${id}:`, error);
      throw error;
    }
  }

  // Cập nhật thông tin cá nhân của người dùng hiện tại
  async updateCurrentUserProfile(userData: {fullName: string; email: string}): Promise<any> {
    try {
      const response = await axios.put<UserResponse>(`${API_URL}/users/profile`, userData, authModule.createAuthConfig());
      
      // Cập nhật thông tin người dùng trong authModule
      if (response.data) {
        const currentUser = authModule.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            email: response.data.email,
            fullName: response.data.fullName
          };
          authModule.setUser(updatedUser);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
      throw error;
    }
  }

  // Cập nhật mật khẩu người dùng
  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    try {
      await axios.put(`${API_URL}/users/password`, passwordData, authModule.createAuthConfig());
    } catch (error) {
      console.error(`Lỗi khi cập nhật mật khẩu:`, error);
      throw error;
    }
  }

  // Xóa người dùng
  async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/users/${id}`, authModule.createAuthConfig());
    } catch (error) {
      console.error(`Lỗi khi xóa người dùng với ID ${id}:`, error);
      throw error;
    }
  }
}

export default new UserService(); 