import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useNotifications } from "../../contexts/NotificationContext";

export const Timeline: React.FC = () => {
  const { notifications } = useNotifications();
  const items = notifications.slice(0, 8);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">No recent activity</div>
          )}
          {items.map((n) => (
            <div key={n.id} className="flex gap-3">
              <div
                className={`mt-1 h-2 w-2 rounded-full ${
                  n.notification_type === "course_update"
                    ? "bg-indigo-500"
                    : n.notification_type?.includes("reject")
                    ? "bg-rose-500"
                    : "bg-emerald-500"
                }`}
              />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {n.title}
                </div>
                <div className="text-xs text-gray-500">{n.message}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Timeline;
