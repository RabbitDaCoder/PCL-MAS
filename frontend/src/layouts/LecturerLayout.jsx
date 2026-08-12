import DashboardShell from "./DashboardShell";
import { lecturerNavItems } from "../data/dashboardNav";

export default function LecturerLayout() {
  return <DashboardShell navItems={lecturerNavItems} />;
}
