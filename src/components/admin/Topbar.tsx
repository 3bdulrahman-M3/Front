import React, { useEffect, useRef, useState } from "react";
import { Bell, Search, Check } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

export const Topbar: React.FC<{
  title: string;
  onSearch?: (value: string) => void;
}> = ({ title, onSearch }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const userRaw =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (popRef.current && !popRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b md:ml-64">
      <div className="h-16 px-4 max-w-7xl mx-auto flex items-center gap-4">
        <h1 className="font-semibold text-lg hidden sm:block">{title}</h1>
        <div className="ml-auto flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative" ref={popRef}>
            <button
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="text-sm font-medium">Notifications</div>
                  <button
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
                    onClick={() => markAllAsRead()}
                  >
                    <Check className="h-3.5 w-3.5" /> Mark all
                  </button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <button
                        key={n.id}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                          n.is_read ? "text-gray-600" : "text-gray-900"
                        }`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="text-sm font-medium line-clamp-1">
                          {n.title}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {n.message}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button className="h-10 w-10 rounded-full ring-2 ring-white overflow-hidden">
              <img
                alt="avatar"
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user?.username || user?.email || "U"
                  )}`
                }
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
