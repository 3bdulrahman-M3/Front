import React, { createContext, useContext, useState, useEffect } from 'react';
import { pollingNotificationService, Notification, NotificationResponse } from '../services/pollingNotificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      console.log('🔔 User logged in, starting notification polling...');
      setConnectionStatus('connecting');
      
      // Subscribe to notification updates
      const unsubscribe = pollingNotificationService.subscribe(handleNotificationUpdate);
      
      // Start polling
      pollingNotificationService.startPolling(15000); // Poll every 15 seconds
      
      setIsConnected(true);
      setConnectionStatus('connected');

      return () => {
        console.log('🔔 Cleaning up notification polling...');
        unsubscribe();
        pollingNotificationService.stopPolling();
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };
    } else {
      console.log('🔔 No token found, not starting notification polling');
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  }, []);

  // Handle notification updates from polling service
  const handleNotificationUpdate = (data: NotificationResponse) => {
    console.log('🔔 Received notification update:', data);
    setNotifications(data.notifications);
    setUnreadCount(data.unread_count);
    
    // Show browser notification for new notifications
    if (data.unread_count > 0 && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        data.notifications.slice(0, 1).forEach(notification => {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/vite.svg', // Your app icon
          });
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await pollingNotificationService.markAsRead(id);
      
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        ).filter(notif => !notif.is_read) // Remove read notifications
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await pollingNotificationService.markAllAsRead();
      
      // Update local state immediately
      setNotifications([]);
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
