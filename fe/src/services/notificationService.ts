import axios from 'axios';
import { API_URL } from '../config/constants';
import authModule from '../modules/auth';

// Define interfaces for notification settings
export interface NotificationSettingResponse {
  id: number;
  userId: number;
  emailNotifications: boolean;
  studyReminders: boolean;
  studyReminderTime: string;
}

export interface UpdateNotificationSettingRequest {
  emailNotifications?: boolean;
  studyReminders?: boolean;
  studyReminderTime?: string;
}

// Service class for notification operations
class NotificationService {
  /**
   * Get current user's notification settings
   * @returns NotificationSettingResponse
   */
  async getNotificationSettings(): Promise<NotificationSettingResponse> {
    try {
      const response = await axios.get<NotificationSettingResponse>(
        `${API_URL}/notifications/settings`, 
        authModule.createAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy cài đặt thông báo:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   * @param settings The settings to update
   * @returns NotificationSettingResponse
   */
  async updateNotificationSettings(settings: UpdateNotificationSettingRequest): Promise<NotificationSettingResponse> {
    try {
      const response = await axios.put<NotificationSettingResponse>(
        `${API_URL}/notifications/settings`,
        settings,
        authModule.createAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật cài đặt thông báo:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 