import api from "../api/api";

export interface Notification {
  id: number;
  sender?: number; // Optional for system notifications
  sender_name?: string;
  receiver: number;
  receiver_name: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface CourseUpdateNotificationData {
  course_id: number;
  title: string;
  message: string;
  update_type: "content" | "announcement" | "assignment" | "schedule";
}

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get("/notifications/");
    return response.data.results || response.data;
  },

  // Mark a specific notification as read
  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/mark_read/`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/mark_all_read/");
  },

  // Get unread count
  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get("/notifications/unread_count/");
    return response.data;
  },

  // Delete a notification
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}/`);
  },

  // Send course update notification (for instructors)
  async sendCourseUpdateNotification(
    courseId: number,
    updateData: CourseUpdateNotificationData
  ): Promise<void> {
    await api.post(`/courses/${courseId}/notify-students/`, updateData);
  },

  // Get notification settings for the current user
  async getNotificationSettings(): Promise<any> {
    const response = await api.get("/notifications/settings/");
    return response.data;
  },

  // Update notification settings
  async updateNotificationSettings(settings: any): Promise<void> {
    await api.put("/notifications/settings/", settings);
  },
};
