import React from "react";
import {
  Home,
  Library,
  Video,
  Users,
  GraduationCap,
  CheckSquare,
  Layers,
  BarChart3,
  MessageCircle,
} from "lucide-react";

type NavItem = {
  key:
    | "home"
    | "courses"
    | "sessions"
    | "students"
    | "instructors"
    | "pending"
    | "categories"
    | "analytics"
    | "chat";
  label: string;
  icon: React.ReactNode;
};

const ITEMS: NavItem[] = [
  { key: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
  {
    key: "courses",
    label: "Courses",
    icon: <Library className="h-5 w-5" />,
  },
  { key: "sessions", label: "Sessions", icon: <Video className="h-5 w-5" /> },
  { key: "students", label: "Users", icon: <Users className="h-5 w-5" /> },
  {
    key: "instructors",
    label: "Instructors",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    key: "pending",
    label: "Approvals",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    key: "categories",
    label: "Categories",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    key: "chat",
    label: "Support Chat",
    icon: <MessageCircle className="h-5 w-5" />,
  },
];

export const Sidebar: React.FC<{
  activeKey?: string;
  onNavigate?: (key: NavItem["key"]) => void;
}> = ({ activeKey, onNavigate }) => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 hidden md:flex flex-col bg-gradient-to-b from-emerald-600 via-indigo-600 to-indigo-700 text-white">
      <div className="h-16 flex items-center px-5 font-semibold tracking-wide border-b border-white/10">
        Admin
      </div>
      <nav className="px-3 space-y-1 overflow-y-auto">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate?.(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition hover:bg-white/10 ${
              activeKey === item.key ? "bg-white/10" : ""
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4 text-xs text-white/70">
        © {new Date().getFullYear()} TutorFlow
      </div>
    </aside>
  );
};

export default Sidebar;
