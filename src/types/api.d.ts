declare module "../../api/api" {
  export const getAdminSummary: () => Promise<any>;
  export const listUsers: (params?: Record<string, unknown>) => Promise<any[]>;
  export const listPendingCourses: () => Promise<any[]>;
  export const listInstructorRequests: () => Promise<any[]>;
  export const approveInstructor: (id: number) => Promise<any>;
  export const rejectInstructor: (id: number, reason?: string) => Promise<any>;
  export const approveCourse: (id: number) => Promise<any>;
  export const rejectCourse: (id: number, reason?: string) => Promise<any>;
}

// Fallback pattern module
declare module "*/api/api" {
  export const getAdminSummary: () => Promise<any>;
  export const listUsers: (params?: Record<string, unknown>) => Promise<any[]>;
  export const listPendingCourses: () => Promise<any[]>;
  export const listInstructorRequests: () => Promise<any[]>;
  export const approveInstructor: (id: number) => Promise<any>;
  export const rejectInstructor: (id: number, reason?: string) => Promise<any>;
  export const approveCourse: (id: number) => Promise<any>;
  export const rejectCourse: (id: number, reason?: string) => Promise<any>;
}
