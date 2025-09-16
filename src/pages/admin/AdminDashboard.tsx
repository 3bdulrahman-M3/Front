import React, { useEffect, useMemo, useState } from "react";
import {
  getAdminSummary,
  listUsers,
  listPendingCourses,
  listInstructorRequests,
  approveInstructor,
  rejectInstructor,
  approveCourse,
  rejectCourse,
  createAdmin,
} from "../../api/api.js";
import { motion, AnimatePresence } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  Search,
  UserPlus,
  BookOpen,
  Trash2,
  Users,
  GraduationCap,
  CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "../../contexts/NotificationContext";
import SalesAnalytics from "../../components/SalesAnalytics";
import ManageCategories from "../../components/ManageCategories";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import StatCard from "../../components/admin/StatCard";
import Transactions from "./Transactions";
import { deleteUser } from "../../api/api.js";

// Deprecated local Card removed after redesign

type AdminSummary = {
  totals?: { users?: number; instructors?: number; courses?: number };
  pending?: { instructor_requests?: number; courses?: number };
};
type InstructorRequest = {
  id: number;
  user_id: number;
  email: string;
  name?: string;
  motivation: string;
  status: string;
  created_at?: string;
  full_name?: string;
  degree?: string;
  certifications?: string;
  documents?: string[];
  photo_url?: string;
};
type CourseRequest = {
  id: number;
  title: string;
  instructor?: number;
  instructor_profile?: { username?: string } | null;
  status: string;
};
type StudentUser = {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  enrolled_courses_count?: number;
  status?: "Active" | "Inactive";
};
type InstructorUser = {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  approved_courses_count?: number;
  status?: "Approved" | "Pending";
};

type SidebarKey =
  | "home"
  | "courses"
  | "sessions"
  | "students"
  | "instructors"
  | "pending"
  | "categories"
  | "analytics"
  | "admins"
  | "chat"
  | "transactions";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [section, setSection] = useState<SidebarKey>("home");

  // Pending approvals state
  const [instructorRequests, setInstructorRequests] = useState<
    InstructorRequest[]
  >([]);
  const [pendingCourses, setPendingCourses] = useState<CourseRequest[]>([]);
  const [instructorReqSearch, setInstructorReqSearch] = useState("");
  const [courseReqSearch, setCourseReqSearch] = useState("");
  const [viewInstructorReq, setViewInstructorReq] =
    useState<InstructorRequest | null>(null);

  // Students state
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatus, setStudentStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  // Instructors state
  const [instructors, setInstructors] = useState<InstructorUser[]>([]);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorStatus, setInstructorStatus] = useState<
    "All" | "Approved" | "Pending"
  >("All");
  // Admins state
  const [admins, setAdmins] = useState<
    Array<{
      id: number;
      email: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      is_superuser?: boolean;
    }>
  >([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "admin" as "admin" | "instructor" | "student",
  });
  const [adminFormErrors, setAdminFormErrors] = useState<
    Record<string, string>
  >({});
  const currentUserRaw =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(
    Boolean(currentUser?.is_superuser)
  );
  const { notifications } = useNotifications();
  const [pendingTab, setPendingTab] = useState<
    "instructors" | "courses" | "rejected"
  >("instructors");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSummary();
        setSummary(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const [reqs, courses] = await Promise.all([
          listInstructorRequests(),
          listPendingCourses(),
        ]);
        setInstructorRequests(reqs);
        setPendingCourses(courses);
      } catch {
        // no-op
      }
    };
    loadPending();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await listUsers({ role: "student" });
        setStudents(data);
      } catch {
        // no-op
      }
    };
    const loadInstructors = async () => {
      try {
        const data = await listUsers({ role: "instructor" });
        setInstructors(data);
      } catch {
        // no-op
      }
    };
    const loadAdmins = async () => {
      try {
        const data = await listUsers({ role: "admin" });
        setAdmins(data);
      } catch {
        // no-op
      }
    };
    loadStudents();
    loadInstructors();
    loadAdmins();
  }, []);

  // If local user lacks is_superuser, try to read it from localStorage when it updates
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : null;
        if (u && typeof u.is_superuser === "boolean")
          setIsSuperAdmin(u.is_superuser);
      } catch {
        // ignore
      }
    };
    window.addEventListener("userUpdated", handler);
    return () => window.removeEventListener("userUpdated", handler);
  }, []);

  // Refresh pending lists when relevant notifications arrive
  useEffect(() => {
    if (!notifications?.length) return;
    const latest = notifications[0] as {
      title?: string;
      notification_type?: string;
    };
    const title = latest?.title || "";
    const type = latest?.notification_type || "";
    const isRelevant =
      title.includes("Instructor Request") ||
      title.includes("Course Approval Needed") ||
      type === "course_update";
    if (isRelevant) {
      (async () => {
        try {
          const [reqs, courses] = await Promise.all([
            listInstructorRequests(),
            listPendingCourses(),
          ]);
          setInstructorRequests(reqs);
          setPendingCourses(courses);
        } catch {
          // ignore
        }
      })();
    }
  }, [notifications]);

  // Filters
  const filteredStudents = useMemo(() => {
    return students.filter((u) => {
      const matchesSearch = `${u.first_name || ""} ${u.last_name || ""} ${
        u.email || ""
      }`
        .toLowerCase()
        .includes(studentSearch.toLowerCase());
      const matchesStatus =
        studentStatus === "All" || u.status === studentStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, studentSearch, studentStatus]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((u) => {
      const matchesSearch = `${u.first_name || ""} ${u.last_name || ""} ${
        u.email || ""
      }`
        .toLowerCase()
        .includes(instructorSearch.toLowerCase());
      const matchesStatus =
        instructorStatus === "All" || u.status === instructorStatus;
      return matchesSearch && matchesStatus;
    });
  }, [instructors, instructorSearch, instructorStatus]);

  const filteredInstructorRequests = useMemo(() => {
    const q = instructorReqSearch.toLowerCase();
    if (!q) return instructorRequests;
    return instructorRequests.filter((r) =>
      `${r.name || ""} ${r.email || ""}`.toLowerCase().includes(q)
    );
  }, [instructorRequests, instructorReqSearch]);

  const filteredPendingInstructorRequests = useMemo(() => {
    return filteredInstructorRequests.filter(
      (r: InstructorRequest) => (r as InstructorRequest).status === "pending"
    );
  }, [filteredInstructorRequests]);

  const filteredRejectedInstructorRequests = useMemo(() => {
    return filteredInstructorRequests.filter(
      (r: InstructorRequest) => (r as InstructorRequest).status === "rejected"
    );
  }, [filteredInstructorRequests]);

  const filteredCourseRequests = useMemo(() => {
    const q = courseReqSearch.toLowerCase();
    if (!q) return pendingCourses;
    return pendingCourses.filter((c) =>
      `${c.title || ""} ${c.instructor_profile?.username || c.instructor || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [pendingCourses, courseReqSearch]);

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.toLowerCase();
    if (!q) return admins;
    return admins.filter((u) =>
      `${u.first_name || ""} ${u.last_name || ""} ${u.email || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [admins, adminSearch]);

  // Approvals handlers with optimistic UI
  const approveInstructorRow = async (id: number) => {
    setInstructorRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await approveInstructor(id);
    } catch {
      // revert on error
      const fresh = await listInstructorRequests();
      setInstructorRequests(fresh);
    }
  };
  const rejectInstructorRow = async (id: number) => {
    setInstructorRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await rejectInstructor(id, "");
    } catch {
      const fresh = await listInstructorRequests();
      setInstructorRequests(fresh);
    }
  };
  const approveCourseRow = async (id: number) => {
    setPendingCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await approveCourse(id);
    } catch {
      const fresh = await listPendingCourses();
      setPendingCourses(fresh);
    }
  };
  const rejectCourseRow = async (id: number) => {
    setPendingCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await rejectCourse(id, "");
    } catch {
      const fresh = await listPendingCourses();
      setPendingCourses(fresh);
    }
  };

  const validateAdminForm = () => {
    const errs: Record<string, string> = {};
    const email = adminForm.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminForm.name.trim()) errs.name = "Name is required";
    if (!email) errs.email = "Email is required";
    else if (!emailRegex.test(email)) errs.email = "Enter a valid email";
    if (!adminForm.password) errs.password = "Password is required";
    else if (adminForm.password.length < 8)
      errs.password = "At least 8 characters";
    if (!adminForm.confirm_password)
      errs.confirm_password = "Confirm your password";
    else if (adminForm.password !== adminForm.confirm_password)
      errs.confirm_password = "Passwords do not match";
    setAdminFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitCreateAdmin = async () => {
    if (!validateAdminForm()) return;
    try {
      const res = await createAdmin(adminForm);
      const newUser = res?.user;
      if (newUser) {
        if (newUser.role === "admin") setAdmins((prev) => [newUser, ...prev]);
        if (newUser.role === "student")
          setStudents((prev) => [newUser, ...prev]);
        if (newUser.role === "instructor")
          setInstructors((prev) => [newUser, ...prev]);
      }
      setShowCreateAdmin(false);
      setAdminForm({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "admin",
      });
      toast.success("User created successfully");
    } catch (err) {
      const extractErrorData = (e: unknown): Record<string, unknown> => {
        if (typeof e === "object" && e !== null) {
          const maybe = e as { response?: { data?: Record<string, unknown> } };
          if (
            maybe.response &&
            typeof maybe.response.data === "object" &&
            maybe.response.data
          ) {
            return maybe.response.data as Record<string, unknown>;
          }
        }
        return {};
      };
      const data = extractErrorData(err);
      const errs: Record<string, string> = {};
      Object.keys(data).forEach((k) => {
        const v = Array.isArray(data[k]) ? data[k][0] : data[k];
        if (typeof v === "string") errs[k] = v;
      });
      setAdminFormErrors(errs);
      const message =
        typeof (data as Record<string, unknown>).message === "string"
          ? ((data as Record<string, unknown>).message as string)
          : "Failed to create user";
      toast.error(message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-l-transparent animate-[spin_1.2s_linear_infinite]"></div>
        </div>
      </div>
    );
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const statusBadge = (status: string) => {
    const normalized = (status || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    if (normalized === "approved")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Approved</span>
      );
    if (normalized === "rejected")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>
      );
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
    );
  };

  const btnBase =
    "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors whitespace-nowrap";
  const btnApprove = `${btnBase} bg-green-600 text-white hover:bg-green-700 active:bg-green-800`;
  const btnReject = `${btnBase} bg-red-600 text-white hover:bg-red-700 active:bg-red-800`;
  const btnView = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800`;

  // Navigation handlers for the fixed sidebar
  const sidebarActiveKey: string | undefined = section;

  const handleSidebarNavigate = (key: SidebarKey) => {
    switch (key) {
      case "pending":
        setSection("pending");
        break;
      case "students":
        setSection("students");
        break;
      case "instructors":
        setSection("instructors");
        break;
      case "categories":
        setSection("categories");
        break;
      case "analytics":
        setSection("analytics");
        break;
      case "home":
        setSection("home");
        break;
      case "courses":
        window.location.href = "/courses";
        break;
      case "sessions":
        window.location.href = "/sessions";
        break;
      case "chat":
        window.location.href = "/admin/chat";
        break;
      case "transactions":
        setSection("transactions");
        break;
      default:
        break;
    }
  };

  const handleTopSearch = (q: string) => {
    if (section === "students") setStudentSearch(q);
    else if (section === "instructors") setInstructorSearch(q);
    else if (section === "pending") setInstructorReqSearch(q);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeKey={sidebarActiveKey}
        onNavigate={handleSidebarNavigate}
      />
      <Topbar title="Admin Dashboard" onSearch={handleTopSearch} />
      <div className="px-4 md:pl-72 max-w-7xl mx-auto py-6">
        {/* Home summary only when Home is selected */}
        {section === "home" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Users"
              value={summary?.totals?.users || 0}
              icon={<Users className="h-5 w-5" />}
              color="indigo"
              delta={{ value: 0, positive: true }}
            />
            <StatCard
              title="Instructors"
              value={summary?.totals?.instructors || 0}
              icon={<GraduationCap className="h-5 w-5" />}
              color="emerald"
              delta={{ value: 0, positive: true }}
            />
            <StatCard
              title="Courses"
              value={summary?.totals?.courses || 0}
              icon={<BookOpen className="h-5 w-5" />}
              color="amber"
              delta={{ value: 0, positive: true }}
            />
            <StatCard
              title="Pending Requests"
              value={
                (summary?.pending?.instructor_requests || 0) +
                (summary?.pending?.courses || 0)
              }
              icon={<CheckSquare className="h-5 w-5" />}
              color="rose"
              delta={{ value: 0, positive: false }}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`lg:col-span-3 rounded-xl bg-white shadow`}>
            <div className="p-6">
              <AnimatePresence mode="wait">
                {section === "pending" && (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="mb-4 border-b px-1">
                      <div className="flex gap-4">
                        {(
                          [
                            {
                              key: "instructors",
                              label: "Instructor Requests",
                            },
                            { key: "rejected", label: "Rejected Instructors" },
                            { key: "courses", label: "Course Requests" },
                          ] as Array<{
                            key: "instructors" | "rejected" | "courses";
                            label: string;
                          }>
                        ).map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setPendingTab(t.key)}
                            className={`relative py-2 px-3 -mb-px text-sm font-medium ${
                              pendingTab === t.key
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {t.label}
                            {pendingTab === t.key && (
                              <motion.div
                                layoutId="pending-underline"
                                className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-1 gap-6">
                      {pendingTab === "instructors" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Instructor Requests
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {filteredPendingInstructorRequests.length}{" "}
                                  pending
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={instructorReqSearch}
                                onChange={(e) =>
                                  setInstructorReqSearch(e.target.value)
                                }
                                placeholder="Search by user or email"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[20%]" />
                                <col className="w-[28%]" />
                                <col className="w-[36%]" />
                                <col className="w-[16%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">User</th>
                                  <th className="py-2">Email</th>
                                  <th className="py-2">Motivation</th>
                                  <th className="py-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredPendingInstructorRequests.map(
                                    (r) => (
                                      <motion.tr
                                        key={r.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-t hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.name || r.user_id}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.email}
                                        </td>
                                        <td
                                          className="py-2 pr-3 truncate"
                                          title={r.motivation}
                                        >
                                          {r.motivation}
                                        </td>
                                        <td className="py-2">
                                          <div className="flex gap-2">
                                            <button
                                              className={btnView}
                                              onClick={() =>
                                                setViewInstructorReq(
                                                  r as InstructorRequest
                                                )
                                              }
                                            >
                                              View
                                            </button>
                                            <button
                                              className={btnApprove}
                                              onClick={() =>
                                                approveInstructorRow(r.id)
                                              }
                                            >
                                              Approve
                                            </button>
                                            <button
                                              className={btnReject}
                                              onClick={() =>
                                                rejectInstructorRow(r.id)
                                              }
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    )
                                  )}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                          {viewInstructorReq && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                              <div className="bg-white rounded-xl shadow p-6 w-[680px] max-w-[95vw]">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">
                                    Instructor Request Details
                                  </h3>
                                  <button
                                    className="text-gray-500"
                                    onClick={() => setViewInstructorReq(null)}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {viewInstructorReq.photo_url && (
                                    <div className="col-span-2 flex justify-center mb-2">
                                      <Zoom>
                                        <img
                                          src={viewInstructorReq.photo_url}
                                          alt="Primary document"
                                          className="w-24 h-24 object-cover rounded border cursor-zoom-in"
                                        />
                                      </Zoom>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-gray-500">User</div>
                                    <div className="font-medium">
                                      {viewInstructorReq.name ||
                                        viewInstructorReq.user_id}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Email</div>
                                    <div className="font-medium">
                                      {viewInstructorReq.email}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">
                                      Full Name
                                    </div>
                                    <div className="font-medium">
                                      {viewInstructorReq.full_name || "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Degree</div>
                                    <div className="font-medium">
                                      {viewInstructorReq.degree || "—"}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="text-gray-500">
                                      Certifications
                                    </div>
                                    <div className="font-medium break-words">
                                      {viewInstructorReq.certifications || "—"}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="text-gray-500">
                                      Motivation
                                    </div>
                                    <div className="font-medium break-words">
                                      {viewInstructorReq.motivation || "—"}
                                    </div>
                                  </div>
                                </div>
                                {Array.isArray(viewInstructorReq.documents) &&
                                  viewInstructorReq.documents.length > 0 && (
                                    <div className="mt-4">
                                      <div className="text-gray-500 mb-2">
                                        Documents
                                      </div>
                                      <div className="flex gap-3 flex-wrap">
                                        {viewInstructorReq.documents.map(
                                          (url: string, idx: number) =>
                                            /\.pdf(\?|$)/i.test(url) ? (
                                              <a
                                                key={idx}
                                                className="text-blue-600 underline"
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                PDF {idx + 1}
                                              </a>
                                            ) : (
                                              <Zoom key={idx}>
                                                <img
                                                  src={url}
                                                  alt={`doc-${idx}`}
                                                  className="w-24 h-24 object-cover rounded border cursor-zoom-in"
                                                />
                                              </Zoom>
                                            )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                <div className="mt-6 flex justify-end gap-2">
                                  <button
                                    className="px-3 py-2 bg-gray-200 rounded"
                                    onClick={() => setViewInstructorReq(null)}
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {pendingTab === "rejected" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Rejected Instructors
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {filteredRejectedInstructorRequests.length}{" "}
                                  rejected
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={instructorReqSearch}
                                onChange={(e) =>
                                  setInstructorReqSearch(e.target.value)
                                }
                                placeholder="Search by user or email"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[20%]" />
                                <col className="w-[28%]" />
                                <col className="w-[36%]" />
                                <col className="w-[16%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">User</th>
                                  <th className="py-2">Email</th>
                                  <th className="py-2">Motivation</th>
                                  <th className="py-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredRejectedInstructorRequests.map(
                                    (r) => (
                                      <motion.tr
                                        key={r.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-t hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.name || r.user_id}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.email}
                                        </td>
                                        <td
                                          className="py-2 pr-3 truncate"
                                          title={r.motivation}
                                        >
                                          {r.motivation}
                                        </td>
                                        <td className="py-2">
                                          {statusBadge(
                                            (r as InstructorRequest).status
                                          )}
                                        </td>
                                      </motion.tr>
                                    )
                                  )}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {pendingTab === "courses" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Course Requests
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {pendingCourses.length} pending
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={courseReqSearch}
                                onChange={(e) =>
                                  setCourseReqSearch(e.target.value)
                                }
                                placeholder="Search by title or instructor"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[36%]" />
                                <col className="w-[28%]" />
                                <col className="w-[16%]" />
                                <col className="w-[20%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">Title</th>
                                  <th className="py-2">Instructor</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredCourseRequests.map((c) => (
                                    <motion.tr
                                      key={c.id}
                                      layout
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      className="border-t hover:bg-gray-50 transition-colors"
                                    >
                                      <td className="py-2">{c.title}</td>
                                      <td className="py-2">
                                        {c.instructor_profile?.username ||
                                          c.instructor}
                                      </td>
                                      <td className="py-2">
                                        {statusBadge(c.status)}
                                      </td>
                                      <td className="py-2">
                                        <div className="flex gap-2">
                                          <button
                                            className={btnApprove}
                                            onClick={() =>
                                              approveCourseRow(c.id)
                                            }
                                          >
                                            Approve
                                          </button>
                                          <button
                                            className={btnReject}
                                            onClick={() =>
                                              rejectCourseRow(c.id)
                                            }
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {section === "students" && (
                  <motion.div
                    key="students"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full md:w-80 px-3 py-2 border rounded"
                      />
                      <select
                        value={studentStatus}
                        onChange={(e) =>
                          setStudentStatus(
                            e.target.value as "All" | "Active" | "Inactive"
                          )
                        }
                        className="px-3 py-2 border rounded w-full md:w-48"
                      >
                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-600 text-sm">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Enrolled Courses</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredStudents.map((s: StudentUser) => (
                            <motion.tr
                              key={s.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-t"
                            >
                              <td className="py-2">
                                {`${s.first_name || ""} ${
                                  s.last_name || ""
                                }`.trim() ||
                                  s.username ||
                                  s.email}
                              </td>
                              <td className="py-2">{s.email}</td>
                              <td className="py-2">
                                {s.enrolled_courses_count ?? 0}
                              </td>
                              <td className="py-2">
                                {s.status ||
                                  (s.is_active ? "Active" : "Inactive")}
                              </td>
                              <td className="py-2">
                                <button
                                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Delete this user? This cannot be undone."
                                      )
                                    )
                                      return;
                                    const snapshot = [...students];
                                    setStudents((prev) =>
                                      prev.filter((u) => u.id !== s.id)
                                    );
                                    try {
                                      await deleteUser(s.id as number);
                                    } catch {
                                      // revert on failure
                                      setStudents(snapshot as StudentUser[]);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </motion.div>
                )}
                {section === "instructors" && (
                  <motion.div
                    key="instructors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <input
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full md:w-80 px-3 py-2 border rounded"
                      />
                      <select
                        value={instructorStatus}
                        onChange={(e) =>
                          setInstructorStatus(
                            e.target.value as "All" | "Approved" | "Pending"
                          )
                        }
                        className="px-3 py-2 border rounded w-full md:w-48"
                      >
                        <option>All</option>
                        <option>Approved</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-600 text-sm">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Approved Courses</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredInstructors.map((i: InstructorUser) => (
                            <motion.tr
                              key={i.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-t"
                            >
                              <td className="py-2">
                                {`${i.first_name || ""} ${
                                  i.last_name || ""
                                }`.trim() ||
                                  i.username ||
                                  i.email}
                              </td>
                              <td className="py-2">{i.email}</td>
                              <td className="py-2">
                                {i.approved_courses_count ?? 0}
                              </td>
                              <td className="py-2">{i.status || "Approved"}</td>
                              <td className="py-2">
                                <button
                                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Delete this user? This cannot be undone."
                                      )
                                    )
                                      return;
                                    const snapshot = [...instructors];
                                    setInstructors((prev) =>
                                      prev.filter((u) => u.id !== i.id)
                                    );
                                    try {
                                      await deleteUser(i.id as number);
                                    } catch {
                                      // revert on failure
                                      setInstructors(
                                        snapshot as InstructorUser[]
                                      );
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </motion.div>
                )}
                {section === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <SalesAnalytics />
                  </motion.div>
                )}
                {section === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <ManageCategories />
                  </motion.div>
                )}
                {section === "admins" && (
                  <motion.div
                    key="admins"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <input
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full md:w-80 px-3 py-2 border rounded"
                      />
                      {isSuperAdmin && (
                        <button
                          className="ml-auto inline-flex items-center gap-2 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                          onClick={() => {
                            setAdminFormErrors({});
                            setShowCreateAdmin(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" /> Create User
                        </button>
                      )}
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-600 text-sm">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Role</th>
                          <th className="py-2">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredAdmins.map((a) => (
                            <motion.tr
                              key={a.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-t"
                            >
                              <td className="py-2">
                                {`${a.first_name || ""} ${
                                  a.last_name || ""
                                }`.trim() ||
                                  a.username ||
                                  a.email}
                              </td>
                              <td className="py-2">{a.email}</td>
                              <td className="py-2">admin</td>
                              <td className="py-2">
                                {a.is_superuser ? "Super Admin" : "Admin"}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>

                    {/* Create Admin Modal */}
                    {showCreateAdmin && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              Create User
                            </h3>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => setShowCreateAdmin(false)}
                            >
                              ✕
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Name
                              </label>
                              <input
                                className="w-full px-3 py-2 border rounded"
                                value={adminForm.name}
                                onChange={(e) =>
                                  setAdminForm({
                                    ...adminForm,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Full name"
                              />
                              {adminFormErrors.name && (
                                <p className="text-xs text-red-600 mt-1">
                                  {adminFormErrors.name}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Email
                              </label>
                              <input
                                className="w-full px-3 py-2 border rounded"
                                value={adminForm.email}
                                onChange={(e) =>
                                  setAdminForm({
                                    ...adminForm,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="email@example.com"
                              />
                              {adminFormErrors.email && (
                                <p className="text-xs text-red-600 mt-1">
                                  {adminFormErrors.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 border rounded"
                                value={adminForm.password}
                                onChange={(e) =>
                                  setAdminForm({
                                    ...adminForm,
                                    password: e.target.value,
                                  })
                                }
                                placeholder="••••••••"
                              />
                              {adminFormErrors.password && (
                                <p className="text-xs text-red-600 mt-1">
                                  {adminFormErrors.password}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 border rounded"
                                value={adminForm.confirm_password}
                                onChange={(e) =>
                                  setAdminForm({
                                    ...adminForm,
                                    confirm_password: e.target.value,
                                  })
                                }
                                placeholder="••••••••"
                              />
                              {adminFormErrors.confirm_password && (
                                <p className="text-xs text-red-600 mt-1">
                                  {adminFormErrors.confirm_password}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Role
                              </label>
                              <select
                                className="w-full px-3 py-2 border rounded bg-gray-50"
                                value={adminForm.role}
                                onChange={(e) =>
                                  setAdminForm({
                                    ...adminForm,
                                    role: e.target.value as
                                      | "admin"
                                      | "instructor"
                                      | "student",
                                  })
                                }
                              >
                                <option value="admin">admin</option>
                                <option value="instructor">instructor</option>
                                <option value="student">student</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-5 flex justify-end gap-2">
                            <button
                              className="px-4 py-2 rounded border"
                              onClick={() => setShowCreateAdmin(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                              onClick={submitCreateAdmin}
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                {section === "transactions" && (
                  <motion.div
                    key="transactions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <Transactions />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Activity feed removed as requested; analytics now uses full width */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
