import DashboardShell from "./DashboardShell";
import { adminNavItems } from "../data/dashboardNav";

export default function AdminLayout() {
  return <DashboardShell navItems={adminNavItems} />;
}
