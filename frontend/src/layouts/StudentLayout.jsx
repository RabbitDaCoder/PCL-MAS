import DashboardShell from "./DashboardShell";
import { studentNavItems } from "../data/dashboardNav";

export default function StudentLayout() {
  return <DashboardShell navItems={studentNavItems} />;
}
