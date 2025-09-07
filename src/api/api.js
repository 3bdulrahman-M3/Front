// src/api.js
import axios from "axios";

// Base instance
const api = axios.create({
  baseURL: "https://educational-platform-production.up.railway.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
});

// 🔑 Interceptor to always attach accessToken if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Global response interceptor to handle expired/invalid sessions
let isHandlingUnauthorized = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);
    const hadStoredToken = Boolean(localStorage.getItem("accessToken"));
    const currentPath = window?.location?.pathname || "";
    const isAuthRoute = ["/login", "/auth/callback", "/register"].includes(
      currentPath
    );

    // Only treat as an expired session if we actually attempted an authenticated request
    if (
      status === 401 &&
      hadAuthHeader &&
      hadStoredToken &&
      !isHandlingUnauthorized &&
      !isAuthRoute
    ) {
      isHandlingUnauthorized = true;
      try {
        // Clear any stored credentials
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Store message for login screen modal and redirect
        try {
          localStorage.setItem(
            "session_expired_message",
            "Your session has expired. Please log in again."
          );
        } catch (_) {}
        window.location.href = "/login";
      } finally {
        // Reset the flag after a short delay to prevent rapid duplicate alerts
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========

// Register
export const register = async (data) => {
  const res = await api.post("auth/register/", data);
  return res.data;
};

// ========== GOOGLE OAUTH2 ENDPOINTS ==========

// Get Google OAuth2 authorization URL
export const getGoogleAuthUrl = async (redirectUri) => {
  const res = await api.get("oauth2/google/auth-url/", {
    params: { redirect_uri: redirectUri },
  });
  return res.data;
};

// Handle Google OAuth2 callback
export const googleAuthCallback = async (code, redirectUri, role) => {
  const payload = { code, redirect_uri: redirectUri };
  if (role) payload.role = role;
  const res = await api.post("oauth2/google/callback/", payload);
  return res.data;
};

// Login
export const login = async (data) => {
  const res = await api.post("auth/login/", data);
  return res.data;
};

// Password reset: request
export const requestPasswordReset = async (email) => {
  const res = await api.post("auth/password-reset/request/", { email });
  return res.data;
};

// Password reset: confirm
export const confirmPasswordReset = async ({
  token,
  new_password,
  confirm_password,
}) => {
  const res = await api.post("auth/password-reset/confirm/", {
    token,
    new_password,
    confirm_password,
  });
  return res.data;
};

// Logout
export const logout = async (refreshToken) => {
  const res = await api.post("auth/logout/", { refresh_token: refreshToken });
  return res.data;
};

// Get Profile
export const getProfile = async () => {
  const res = await api.get("auth/profile/");
  return res.data;
};

// Update Profile
export const updateProfile = async (data) => {
  const res = await api.put("auth/profile/update/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // ✅ file uploads
    },
  });
  return res.data;
};

// ====== Instructor Request & Admin Approval ======
export const requestInstructor = async (motivation = "") => {
  const res = await api.post("auth/instructor/request/", { motivation });
  return res.data;
};

export const listInstructorRequests = async () => {
  const res = await api.get("auth/instructor/requests/");
  return res.data;
};

export const approveInstructor = async (requestId) => {
  const res = await api.post(`auth/instructor/requests/${requestId}/approve/`);
  return res.data;
};

export const rejectInstructor = async (requestId, reason = "") => {
  const res = await api.post(`auth/instructor/requests/${requestId}/reject/`, {
    reason,
  });
  return res.data;
};

// ====== Course admin approvals ======
export const listPendingCourses = async () => {
  const res = await api.get("courses/pending/");
  return res.data;
};

export const approveCourse = async (courseId) => {
  const res = await api.post(`courses/${courseId}/approve/`);
  return res.data;
};

export const rejectCourse = async (courseId, reason = "") => {
  const res = await api.post(`courses/${courseId}/reject/`, { reason });
  return res.data;
};

// ====== Admin analytics ======
export const getAdminSummary = async () => {
  const res = await api.get("admin/analytics/summary/");
  return res.data;
};

// Sales analytics (to be wired to backend when available)
export const getSalesPerCourse = async () => {
  const res = await api.get("admin/sales/courses/");
  return res.data;
};

export const getSalesPerCategory = async () => {
  const res = await api.get("admin/sales/categories/");
  return res.data;
};

export const getRevenueTrends = async (range = "last_month") => {
  const res = await api.get("admin/sales/revenue/", { params: { range } });
  return res.data;
};

// ====== Admin categories (CRUD) ======
export const adminListCategories = async (params = {}) => {
  const res = await api.get("admin/categories/", { params });
  return res.data;
};

export const adminCreateCategory = async (data) => {
  const res = await api.post("admin/categories/create/", data);
  return res.data;
};

export const adminUpdateCategory = async (id, data) => {
  const res = await api.put(`admin/categories/${id}/`, data);
  return res.data;
};

export const adminDeleteCategory = async (id) => {
  const res = await api.delete(`admin/categories/${id}/delete/`);
  return res.data;
};

// ========== COURSES ENDPOINTS ==========

// List courses
export const getCourses = async (params = {}) => {
  const res = await api.get("courses/", { params });
  return res.data;
};

// List categories
export const getCategories = async () => {
  const res = await api.get("courses/categories/");
  return res.data;
};

// Create course
export const createCourse = async (data) => {
  const res = await api.post("courses/create/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // ✅ file uploads
    },
  });
  return res.data;
};

// Single course detail
export const getCourse = async (id) => {
  const res = await api.get(`courses/${id}/`);
  return res.data;
};

export const getCourseRcommendation = async (id) => {
  const res = await api.get(`courses/${id}/recommend/`);
  return res.data;
};

export const getUserRecommendation = async () => {
  const res = await api.get(`courses/recommend/`);
  return res.data;
};

// ========== ADMIN USERS ==========
export const listUsers = async (params = {}) => {
  const res = await api.get("auth/users/", { params });
  return res.data;
};

// Admin: create a new admin (super-admin only)
export const createAdmin = async ({
  name,
  email,
  password,
  confirm_password,
  role = "admin",
}) => {
  const res = await api.post("auth/admin/create/", {
    name,
    email,
    password,
    confirm_password,
    role,
  });
  return res.data;
};

// Admin: delete user by id
export const deleteUser = async (userId) => {
  const res = await api.delete(`auth/users/${userId}/delete/`);
  return res.data;
};

// ========== ENROLLMENTS ENDPOINTS ==========

// Enroll in a course
export const enrollInCourse = async (courseId, data) => {
  const res = await api.post(`courses/${courseId}/enroll/`, data);
  return res.data;
};

// Withdraw from a course
export const withdrawFromCourse = async (courseId) => {
  const res = await api.post(`courses/${courseId}/withdraw/`);
  return res.data;
};

// Get all enrollments for a student
export const getStudentEnrollments = async (studentId) => {
  const res = await api.get(`courses/student/${studentId}/enrollments/`);
  return res.data;
};

// Instructor: list created courses
export const getInstructorCourses = async (instructorId) => {
  const res = await api.get(`courses/instructor/${instructorId}/courses/`);
  return res.data.courses;
};

// Update a course
export const updateCourse = async (id, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`courses/${id}/update/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

// Delete a course
export const deleteCourse = async (id) => {
  const res = await api.delete(`courses/${id}/delete/`);
  return res.data;
};

// ========== VIDEOS ENDPOINTS ==========
export const getCourseVideos = async (courseId) => {
  const res = await api.get(`courses/${courseId}/videos/`);
  return res.data;
};

export const createCourseVideo = async (courseId, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.post(`courses/${courseId}/videos/create/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

export const updateVideo = async (videoId, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`courses/videos/${videoId}/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

export const deleteVideo = async (videoId) => {
  const res = await api.delete(`courses/videos/${videoId}/`);
  return res.data;
};

// ========== EXAMS ENDPOINTS ==========
export const createExam = async (payload) => {
  const res = await api.post(`exams/exams/`, payload);
  return res.data;
};

// ========== SESSIONS ENDPOINTS ==========
export const getSessions = async () => {
  const res = await api.get("live/sessions/");
  return res.data;
};

export const createSession = async (data) => {
  const res = await api.post("live/sessions/create/", data);
  return res.data;
};

export const getSession = async (id) => {
  const res = await api.get(`live/sessions/${id}/`);
  return res.data;
};

export const getJitsiToken = async (roomName) => {
  const res = await api.post("live/jaas-token/", { room_name: roomName });
  return res.data;
};

// ========== REVIEWS ENDPOINTS ==========
export const getCourseReviews = async (courseId, params = {}) => {
  const res = await api.get(`courses/${courseId}/reviews/list/`, { params });
  return res.data;
};

export const createReview = async (courseId, data) => {
  const res = await api.post(`courses/${courseId}/reviews/`, data);
  return res.data;
};

export const editReview = async (reviewId, data) => {
  const res = await api.put(`courses/reviews/${reviewId}/`, data);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`courses/reviews/${reviewId}/delete/`);
  return res.data;
};

// ========== NOTES ENDPOINTS ==========
export const getCourseNotes = async (courseId, params = {}) => {
  console.log("params", params);
  const res = await api.get(`courses/${courseId}/notes/list/`, { params });
  console.log(res.data);
  return res.data;
};

export const createNote = async (courseId, data) => {
  const res = await api.post(`courses/${courseId}/notes/`, data);
  return res.data;
};

export const editNote = async (noteId, data) => {
  const res = await api.put(`courses/notes/${noteId}/`, data);
  return res.data;
};

export const deleteNote = async (noteId) => {
  const res = await api.delete(`courses/notes/${noteId}/delete/`);
  return res.data;
};

export default api;

//Payment

export const createPaymentIntent = async (courseId, data) => {
  const res = await api.post(
    `courses/${courseId}/create_payment_intent/`,
    data
  );
  return res.data;
};

//Chat

export const askChat = async (message) => {
  const res = await api.post(`chatbot/message/`, { message });
  return res.data;
};
