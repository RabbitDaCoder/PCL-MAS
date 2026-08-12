// Single source of truth for each role's nav items — DashboardShell re-renders this same list
// as a sidebar (desktop) and a bottom nav (mobile), so it's defined once here.
import {
  Home,
  GraduationCap,
  MessageCircle,
  User,
  HelpCircle,
  LayoutDashboard,
  Users,
  Server,
} from "lucide-react";

export const studentNavItems = [
  { key: "home", label: "Home", to: "/student/dashboard", icon: Home },
  {
    key: "classes",
    label: "Classes",
    to: "/student/classes",
    icon: GraduationCap,
  },
  { key: "ask", label: "Ask", to: "/student/ask", icon: HelpCircle },
  { key: "chat", label: "Chat", to: "/student/chat", icon: MessageCircle },
  { key: "profile", label: "Profile", to: "/student/profile", icon: User },
];

export const lecturerNavItems = [
  { key: "home", label: "Home", to: "/lecturer/dashboard", icon: Home },
  {
    key: "classes",
    label: "Classes",
    to: "/lecturer/classes",
    icon: GraduationCap,
  },
  {
    key: "questions",
    label: "Questions",
    to: "/lecturer/questions",
    icon: HelpCircle,
  },
  { key: "chat", label: "Chat", to: "/lecturer/chat", icon: MessageCircle },
  { key: "profile", label: "Profile", to: "/lecturer/profile", icon: User },
];

export const adminNavItems = [
  {
    key: "overview",
    label: "Overview",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  { key: "users", label: "Users", to: "/admin/users", icon: Users },
  {
    key: "classes",
    label: "Classes",
    to: "/admin/classes",
    icon: GraduationCap,
  },
  { key: "system", label: "System", to: "/admin/system", icon: Server },
];
