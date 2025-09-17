import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./layout/Layout";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CoursesPage from "./pages/CoursesPage";
import Profile from "./pages/ProfilePage";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/CreateCourse";
import MyCourses from "./pages/MyCourses";
import Sessions from "./pages/LiveSessions";
import SessionDetail from "./pages/SessionDetail";
import CreateSession from "./pages/CreateSession";
import EnrolledCourseDetais from "./pages/EnrolledCoursePage";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import PaymentPage from "./pages/PaymentPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminChat from "./pages/AdminChat";
import TransactionDetail from "./pages/admin/TransactionDetail";
// import PendingApprovals from "./pages/admin/PendingApprovals";
import RequireRole from "./components/RequireRole";
import "./App.css"; // Assuming you have a global CSS file for styles
import NotFound from "./pages/NotFound";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/mycourses" element={<MyCourses />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/sessions/create" element={<CreateSession />} />
            <Route path="/courses/:id" element={<EnrolledCourseDetais />} />
            <Route path="/courses/:id/payment" element={<PaymentPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          <Route path="/payment/:paymentId" element={<PaymentPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <RequireRole role="admin">
                <AdminChat />
              </RequireRole>
            }
          />
          <Route
            path="/admin/transactions/:id"
            element={
              <RequireRole role="admin">
                <TransactionDetail />
              </RequireRole>
            }
          />
          {/* Instructor */}
          <Route
            path="/instructor"
            element={
              <RequireRole role="instructor">
                <InstructorDashboard />
              </RequireRole>
            }
          />
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </NotificationProvider>
  );
}

export default App;
