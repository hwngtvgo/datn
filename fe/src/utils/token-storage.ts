/**
 * Tiện ích lưu trữ JWT token vào localStorage và cookies
 */
export class TokenStorage {
  private static readonly TOKEN_KEY = 'jwt_token';
  
  /**
   * Lưu trữ token vào localStorage
   * 
   * @param token JWT token cần lưu
   */
  public static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  /**
   * Lấy token từ localStorage hoặc từ cookie
   * 
   * @returns JWT token hoặc null nếu không tồn tại
   */
  public static getToken(): string | null {
    // Ưu tiên token từ cookie (do server thiết lập)
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('toeic-jwt=')) {
        return cookie.substring('toeic-jwt='.length, cookie.length);
      }
    }
    
    // Nếu không có token trong cookie, thử lấy từ localStorage
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Xóa token khỏi localStorage
   */
  public static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Không thể xóa cookie từ client nếu cookie được thiết lập là HTTPOnly
  }
} 