import axios from 'axios';
import { API_URL } from '@/config/constants';

// Kiểu dữ liệu
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role?: string;
  roles?: string[];
  accessToken: string;
  tokenType: string;
  lastChecked?: number;
}

class AuthModule {
  private static instance: AuthModule;
  private user: AuthUser | null = null;
  
  private constructor() {
    // Khởi tạo từ localStorage nếu có
    this.loadUserFromStorage();
    
    // Thiết lập interceptor cho axios
    this.setupInterceptors();
  }
  
  // Singleton pattern
  public static getInstance(): AuthModule {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule();
    }
    return AuthModule.instance;
  }
  
  // Khởi tạo từ localStorage
  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        console.log('Đã tải thông tin người dùng từ localStorage');
        
        // Tự động thiết lập token cho tất cả các requests
        if (this.user?.accessToken) {
          this.setAuthHeader(this.user.accessToken);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng từ localStorage:', error);
      this.user = null;
    }
  }
  
  // Thiết lập interceptors cho axios
  private setupInterceptors(): void {
    // Interceptor cho response để tự động refresh token
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Thử refresh token
            const result = await this.refreshToken();
            if (result) {
              // Cập nhật header và thử lại request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Xóa thông tin người dùng nếu không refresh được
            this.clearAuth();
            
            // Chuyển đến trang đăng nhập nếu không ở trang đăng nhập
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Lấy token hiện tại
  public getToken(): string | null {
    return this.user?.accessToken || null;
  }
  
  // Thiết lập Authorization header cho tất cả các request
  public setAuthHeader(token: string): void {
    if (token) {
      console.log('Thiết lập token cho tất cả các request');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('Xóa token khỏi header');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
  
  // Lưu thông tin người dùng
  public setUser(user: AuthUser): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.accessToken) {
      this.setAuthHeader(user.accessToken);
    }
  }
  
  // Lấy thông tin người dùng hiện tại
  public getUser(): AuthUser | null {
    return this.user;
  }
  
  // Kiểm tra người dùng đã đăng nhập chưa
  public isLoggedIn(): boolean {
    return !!this.user;
  }
  
  // Kiểm tra người dùng có quyền admin không
  public isAdmin(): boolean {
    if (!this.user) return false;
    
    // Kiểm tra từ roles array
    const hasAdminRoleInArray = Array.isArray(this.user.roles) && 
      (this.user.roles.includes('ROLE_ADMIN') || this.user.roles.includes('ADMIN'));
    
    // Kiểm tra từ role string
    const hasAdminRoleAsString = typeof this.user.role === 'string' && 
      (this.user.role === 'ROLE_ADMIN' || this.user.role === 'ADMIN');
    
    return hasAdminRoleInArray || hasAdminRoleAsString;
  }
  
  // Refresh token
  public async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        withCredentials: true
      });
      
      if (response.data && response.data.accessToken) {
        // Kiểm tra nếu user hiện tại không tồn tại, trả về false
        if (!this.user) {
          return false;
        }
        
        // Cập nhật thông tin người dùng với token mới
        const userData: AuthUser = {
          ...this.user,
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType || this.user.tokenType || 'Bearer',
          lastChecked: Date.now()
        };
        
        this.setUser(userData);
        console.log('Đã cập nhật token mới sau khi refresh');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      throw error;
    }
  }
  
  // Đăng xuất
  public logout(): void {
    this.clearAuth();
  }
  
  // Xóa thông tin xác thực
  private clearAuth(): void {
    this.user = null;
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }
  
  // Khởi tạo request config với token
  public createAuthConfig(): Record<string, any> {
    const token = this.getToken();
    
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
  }
}

// Export instance duy nhất
const authModule = AuthModule.getInstance();
export default authModule; 