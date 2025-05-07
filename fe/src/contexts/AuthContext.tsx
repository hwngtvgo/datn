import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse } from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra phiên đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Đầu tiên kiểm tra xem có dữ liệu người dùng trong localStorage không
        const storedUser = authService.getCurrentUser();
        
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Sau đó kiểm tra trạng thái đăng nhập với server (dựa vào cookie)
        const isAuthenticated = await authService.checkAuthStatus();
        
        if (!isAuthenticated && storedUser) {
          // Nếu server nói không đăng nhập nhưng localStorage có dữ liệu
          // thì đồng bộ lại bằng cách xóa dữ liệu cũ
          setUser(null);
        } else if (isAuthenticated && !storedUser) {
          // Nếu server nói đã đăng nhập nhưng localStorage không có dữ liệu
          // thì lấy lại dữ liệu mới từ localStorage (đã được cập nhật bởi checkAuthStatus)
          setUser(authService.getCurrentUser());
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo xác thực:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ username, password });
      setUser(response);
    } catch (error) {
      // Đảm bảo lỗi được truyền lại cho component xử lý
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, email: string, fullName: string) => {
    try {
      setLoading(true);
      const response = await authService.register({ username, password, email, fullName });
      setUser(response);
    } catch (error) {
      // Đảm bảo lỗi được truyền lại cho component xử lý
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      // Sử dụng biến cờ để kiểm soát việc không gọi lại nhiều lần
      const isAuthenticated = await authService.checkAuthStatus();
      
      // Chỉ cập nhật user state khi cần thiết
      if (isAuthenticated) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && (!user || JSON.stringify(currentUser) !== JSON.stringify(user))) {
          console.log('Cập nhật thông tin người dùng trong context:', currentUser);
          setUser(currentUser);
        }
      } else if (user !== null) {
        setUser(null);
      }
      
      return isAuthenticated;
    } catch (error) {
      console.error('Lỗi khi kiểm tra xác thực:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 