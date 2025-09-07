import { api } from "../api/api";

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  timestamp: string;
}

class PollingNotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private callbacks: ((notifications: NotificationResponse) => void)[] = [];
  private lastFetch: string | null = null;
  private isPolling = false;

  // Start polling for notifications
  startPolling(intervalMs: number = 30000) {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log("🔔 Starting notification polling...");

    // Fetch immediately
    this.fetchNotifications();

    // Then poll at intervals
    this.pollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, intervalMs);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log("🔔 Stopped notification polling");
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: NotificationResponse) => void) {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // Fetch notifications from API
  private async fetchNotifications() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("🔔 No token found, stopping polling");
        this.stopPolling();
        return;
      }

      const response = await api.get("/notifications/recent/");
      const data: NotificationResponse = response.data;

      // Only notify subscribers if there are new notifications
      if (this.shouldNotify(data)) {
        console.log("🔔 New notifications received:", data.unread_count);
        this.callbacks.forEach((callback) => callback(data));
      }

      this.lastFetch = data.timestamp;
    } catch (error) {
      console.error("🔔 Failed to fetch notifications:", error);

      // If unauthorized, stop polling
      if ((error as any)?.response?.status === 401) {
        console.log("🔔 Unauthorized, stopping polling");
        this.stopPolling();
      }
    }
  }

  // Check if we should notify subscribers
  private shouldNotify(data: NotificationResponse): boolean {
    // Always notify on first fetch
    if (!this.lastFetch) return true;

    // Notify if there are unread notifications
    return data.unread_count > 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: number) {
    try {
      await api.patch(`/notifications/${notificationId}/mark_read/`);
      console.log("🔔 Notification marked as read:", notificationId);

      // Fetch fresh data
      this.fetchNotifications();
    } catch (error) {
      console.error("🔔 Failed to mark notification as read:", error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.post("/notifications/mark_all_read/");
      console.log("🔔 All notifications marked as read");

      // Fetch fresh data
      this.fetchNotifications();
    } catch (error) {
      console.error("🔔 Failed to mark all notifications as read:", error);
    }
  }

  // Get current polling status
  isActive(): boolean {
    return this.isPolling;
  }
}

// Export singleton instance
export const pollingNotificationService = new PollingNotificationService();
