import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../api/api";

interface Notification {
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
  data?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  // Initialize WebSocket connection
  useEffect(() => {
    // Try different possible token keys
    let token = localStorage.getItem("accessToken");
    if (!token) {
      token = localStorage.getItem("token");
    }
    if (!token) {
      token = localStorage.getItem("authToken");
    }
    if (!token) {
      token = localStorage.getItem("jwt");
    }

    console.log("🔔 Token from localStorage:", token ? "Found" : "Not found");
    console.log("🔔 Available localStorage keys:", Object.keys(localStorage));

    if (token) {
      setConnectionStatus("connecting");
      console.log("🔔 Attempting WebSocket connection...");

      // Add a small delay to ensure server is ready
      const connectTimeout = setTimeout(() => {
        try {
          // Derive WebSocket URL from API base URL or window location
          const apiBase = (api.defaults?.baseURL || "").replace(/\/+$/, "");
          const wsUrl = (() => {
            try {
              const parsed = new URL(apiBase || window.location.origin);
              const proto = parsed.protocol === "https:" ? "wss:" : "ws:";
              return `${proto}//${parsed.host}/ws/notifications/`;
            } catch {
              const fallbackProto =
                window.location.protocol === "https:" ? "wss:" : "ws:";
              return `${fallbackProto}//${window.location.host}/ws/notifications/`;
            }
          })();

          // Create native WebSocket connection
          const newSocket = new WebSocket(wsUrl);

          newSocket.onopen = () => {
            console.log("🔔 Connected to notification WebSocket");
            setIsConnected(true);
            setConnectionStatus("connected");

            // Send authentication token
            const authMessage = {
              type: "auth",
              token: token,
            };
            console.log("🔔 Sending auth message:", authMessage);
            newSocket.send(JSON.stringify(authMessage));
          };

          newSocket.onclose = (event) => {
            console.log(
              "🔔 Disconnected from notification WebSocket",
              event.code,
              event.reason
            );
            setIsConnected(false);
            setConnectionStatus("disconnected");

            // If connection was closed due to server error, try to reconnect after 5 seconds
            if (event.code === 1006 || event.code === 1011) {
              console.log(
                "🔔 WebSocket connection failed, will retry in 5 seconds..."
              );
              setTimeout(() => {
                setConnectionStatus("connecting");
              }, 5000);
            }
          };

          newSocket.onerror = (error) => {
            console.error("🔔 WebSocket connection error:", error);
            setConnectionStatus("error");
            setIsConnected(false);
          };

          newSocket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log("🔔 Received WebSocket message:", data);

              if (data.type === "notification") {
                console.log("🔔 Received notification:", data.notification);
                setNotifications((prev) => [data.notification, ...prev]);

                // Show browser notification if permission granted
                if (Notification.permission === "granted") {
                  new Notification(data.notification.title, {
                    body: data.notification.message,
                    icon: "/favicon.ico",
                    tag: `notification-${data.notification.id}`,
                  });
                }
              } else if (data.type === "auth_success") {
                console.log("🔔 WebSocket authentication successful");
                setConnectionStatus("connected");
              } else if (data.type === "auth_error") {
                console.error(
                  "🔔 WebSocket authentication failed:",
                  data.message
                );
                setConnectionStatus("error");
                setIsConnected(false);
              }
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          setSocket(newSocket);

          // Request notification permission
          if (
            window.Notification &&
            window.Notification.permission === "default"
          ) {
            window.Notification.requestPermission();
          }
        } catch (error) {
          console.error("🔔 Error creating WebSocket:", error);
          setConnectionStatus("error");
        }
      }, 1000); // 1 second delay

      return () => {
        clearTimeout(connectTimeout);
        if (socket) {
          socket.close();
        }
      };
    }
  }, []);

  // Fetch existing notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const apiBase = (api.defaults?.baseURL || "").replace(/\/+$/, "");
        const response = await fetch(`${apiBase}/notifications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.results || data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const apiBase = (api.defaults?.baseURL || "").replace(/\/+$/, "");
      const response = await fetch(
        `${apiBase}/notifications/${id}/mark_read/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const apiBase = (api.defaults?.baseURL || "").replace(/\/+$/, "");
      const response = await fetch(`${apiBase}/notifications/mark_all_read/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        isConnected,
        connectionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
