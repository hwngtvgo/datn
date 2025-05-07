import axios from 'axios';
import { API_URL } from '../config/constants';
import authModule from '../modules/auth';
import { AuthUser } from '../modules/auth';

const AUTH_API_URL = `${API_URL}/auth`;

// Cấu hình axios mặc định
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;  // Cho phép gửi cookie
axios.defaults.timeout = 10000; // Timeout cho các request

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Hàm đăng ký callback khi refresh token hoàn tất
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Hàm thực thi tất cả callback với token mới
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Thêm interceptor để tự động refresh token khi token hết hạn
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Danh sách các URL không cần thử refresh token
    const shouldSkipRefresh = 
      originalRequest.url.includes('/login') || 
      originalRequest.url.includes('/refresh-token') ||
      originalRequest.url.includes('/register');
    
    // Chỉ thử refresh token nếu đáp ứng tất cả các điều kiện:
    // 1. Nhận lỗi 401 (Unauthorized)
    // 2. Chưa thử refresh trước đó với request này 
    // 3. Không phải là request login/register/refresh-token
    // 4. Chưa có process refresh token đang chạy
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !shouldSkipRefresh &&
        !isRefreshing) {
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.post<AuthUser>(`${AUTH_API_URL}/refresh-token`, {}, {
          withCredentials: true
        });
        
        // Lưu thông tin người dùng
        if (response.data) {
          authModule.setUser(response.data);
          
          // Thông báo cho tất cả các request đang chờ
          onRefreshed('token-refreshed');
          
          // Reset trạng thái
          isRefreshing = false;
          
          // Thực hiện lại request ban đầu
          return authModule.getUser();
        }
      } catch (refreshError) {
        // Reset trạng thái refresh
        isRefreshing = false;
        refreshSubscribers = [];
        
        // Nếu không refresh được token, đăng xuất
        authModule.logout();
        
        // Không redirect nếu đang ở trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401 && isRefreshing && !shouldSkipRefresh) {
      // Nếu đang có quá trình refresh token, đăng ký callback để thực hiện lại request này
      // sau khi refresh token thành công
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          // Thực hiện lại request ban đầu sau khi có token mới
          resolve(authModule.getUser());
        });
      });
    }
    
    // Trả về lỗi nếu không thể xử lý
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserStatus {
  username: string;
  authenticated: boolean;
  role?: string;
}

class AuthService {
  async login(loginRequest: LoginRequest): Promise<AuthUser> {
    try {
      console.log('Đang đăng nhập với:', { username: loginRequest.username });
      const response = await axios.post<AuthUser>(`${AUTH_API_URL}/login`, loginRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true  // Để nhận cookie
      });
      
      console.log('Kết quả đăng nhập:', response.data);
      
      if (response.data.accessToken) {
        // Lưu thông tin người dùng vào auth module
        authModule.setUser(response.data);
        console.log('Đăng nhập thành công, token đã được lưu trữ');
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  }

  async register(registerRequest: RegisterRequest): Promise<AuthUser> {
    try {
      const response = await axios.post<AuthUser>(`${AUTH_API_URL}/register`, registerRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true  // Để nhận cookie
      });
      
      if (response.data) {
        // Lưu thông tin người dùng vào auth module
        authModule.setUser(response.data);
      }
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Phân tích chi tiết lỗi từ server
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          } else if (error.response.data && error.response.data.errors) {
            // Trường hợp có nhiều lỗi validation
            const errorMessages = Object.values(error.response.data.errors).join(', ');
            throw new Error(errorMessages);
          }
        }
      }
      console.error('Lỗi đăng ký:', error);
      throw new Error('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
    }
  }
  
  // Phương thức gửi yêu cầu đặt lại mật khẩu
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post<{ success: boolean; message: string }>(
        `${AUTH_API_URL}/password/reset-request`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
      throw new Error('Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  }

  // Phương thức xác thực token đặt lại mật khẩu
  async validateResetToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get<{ success: boolean; message: string }>(
        `${AUTH_API_URL}/password/validate-token`,
        {
          params: { token },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      console.error('Lỗi khi xác thực token:', error);
      throw new Error('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
  }

  // Phương thức đặt lại mật khẩu với token
  async resetPassword(resetRequest: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post<{ success: boolean; message: string }>(
        `${AUTH_API_URL}/password/reset`,
        resetRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          // Lỗi dữ liệu đầu vào
          if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          } else if (error.response.data && error.response.data.errors) {
            // Trường hợp có nhiều lỗi validation
            const errorMessages = Object.values(error.response.data.errors).join(', ');
            throw new Error(errorMessages);
          }
        } else if (error.response.status === 401) {
          throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
      }
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      throw new Error('Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  }

  logout(): void {
    // Sử dụng authModule để đăng xuất
    authModule.logout();
    console.log('Đã đăng xuất, token đã bị xóa');
  }

  // Kiểm tra trạng thái đăng nhập từ server
  async checkAuthStatus(): Promise<boolean> {
    try {
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await axios.get<UserStatus>(`${AUTH_API_URL}/me?_=${timestamp}`, {
        headers: {
          // Thêm Cache-Control để tránh cache
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...authModule.createAuthConfig().headers
        }
      });
      
      if (response.data && response.data.authenticated) {
        // Cập nhật thông tin người dùng trong auth module
        const currentUser = authModule.getUser();
        if (currentUser) {
          const user: AuthUser = {
            ...currentUser,
            username: response.data.username,
            role: response.data.role || 'ROLE_USER',
            // Tạo mảng roles từ role nếu chưa có
            roles: currentUser.roles || [response.data.role || 'ROLE_USER'],
            lastChecked: Date.now()
          };
          
          authModule.setUser(user);
        }
        return true;
      } else {
        console.log('Người dùng chưa xác thực hoặc hết phiên làm việc');
        authModule.logout();
        return false;
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
      // Chỉ đăng xuất khi chắc chắn 401/403
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        authModule.logout();
      }
      return false;
    }
  }

  getCurrentUser(): AuthUser | null {
    return authModule.getUser();
  }

  isLoggedIn(): boolean {
    return authModule.isLoggedIn();
  }
  
  isAdmin(): boolean {
    return authModule.isAdmin();
  }

  // Phương thức kiểm tra cookie 
  getCookies(): void {
    const allCookies = document.cookie;
    console.log('Tất cả cookie hiện tại:', allCookies);
    
    // Kiểm tra JWT cookie
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('toeic-jwt=')) {
        console.log('Đã tìm thấy cookie JWT:', cookie);
        return;
      }
    }
    console.log('Không tìm thấy cookie JWT');
  }
}

// Tạo instance
const authService = new AuthService();
export default authService;