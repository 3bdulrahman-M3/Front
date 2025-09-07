export declare const getAdminSummary: () => Promise<any>;
export declare const listUsers: (
  params?: Record<string, unknown>
) => Promise<any[]>;
export declare const listPendingCourses: () => Promise<any[]>;
export declare const listInstructorRequests: () => Promise<any[]>;
export declare const approveInstructor: (id: number) => Promise<any>;
export declare const rejectInstructor: (
  id: number,
  reason?: string
) => Promise<any>;
export declare const approveCourse: (id: number) => Promise<any>;
export declare const rejectCourse: (
  id: number,
  reason?: string
) => Promise<any>;
export declare const createAdmin: (payload: {
  name?: string;
  email: string;
  password: string;
  confirm_password: string;
  role?: string;
}) => Promise<any>;
export declare const deleteUser: (userId: number) => Promise<any>;
export declare const getCourses: (
  params?: Record<string, unknown>
) => Promise<any[]>;
