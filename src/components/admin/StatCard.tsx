import React from "react";
import { Card, CardContent } from "../ui/card";

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  delta?: { value: number; positive?: boolean } | null;
  icon?: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}> = ({ title, value, delta, icon, color = "indigo" }) => {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  const badge = delta
    ? `${
        delta.positive === false
          ? "text-red-600 bg-red-50"
          : "text-emerald-600 bg-emerald-50"
      }`
    : "";
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 flex items-center gap-4">
        {icon && (
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        {delta && (
          <div className={`text-xs px-2 py-1 rounded-full ${badge}`}>{`${
            delta.positive === false ? "-" : "+"
          }${Math.abs(delta.value)}%`}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
