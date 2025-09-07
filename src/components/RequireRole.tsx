import React from "react";
import { Navigate } from "react-router-dom";

const RequireRole: React.FC<{
  role: "admin" | "instructor" | "student";
  children: React.ReactNode;
}> = ({ role, children }) => {
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default RequireRole;
