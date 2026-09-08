// Central route table. Keeps route wiring separate from page implementations.
import { Routes, Route, Navigate } from "react-router-dom";
import GuestOnlyRoute from "./GuestOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ComingSoonPage from "../pages/ComingSoonPage";
import StudentLogin from "../pages/student/StudentLogin";
import StudentRegister from "../pages/student/StudentRegister";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentClasses from "../pages/student/StudentClasses";
import StudentClassWorkspace from "../pages/student/StudentClassWorkspace";
import StudentClassMaterials from "../pages/student/StudentClassMaterials";
import StudentClassPretest from "../pages/student/StudentClassPretest";
import StudentClassLearningPath from "../pages/student/StudentClassLearningPath";
import StudentClassProgress from "../pages/student/StudentClassProgress";
import StudentClassAssignments from "../pages/student/StudentClassAssignments";
import StudentClassAiChat from "../pages/student/StudentClassAiChat";
import StudentChat from "../pages/student/StudentChat";
import AskQuestion from "../pages/student/AskQuestion";
import StudentProfile from "../pages/student/StudentProfile";
import LecturerLogin from "../pages/lecturer/LecturerLogin";
import LecturerRegister from "../pages/lecturer/LecturerRegister";
import LecturerDashboard from "../pages/lecturer/LecturerDashboard";
import LecturerClasses from "../pages/lecturer/LecturerClasses";
import LecturerClassCreate from "../pages/lecturer/LecturerClassCreate";
import LecturerClassWorkspace from "../pages/lecturer/LecturerClassWorkspace";
import LecturerClassMaterials from "../pages/lecturer/LecturerClassMaterials";
import LecturerClassPretest from "../pages/lecturer/LecturerClassPretest";
import LecturerClassProgress from "../pages/lecturer/LecturerClassProgress";
import LecturerClassAssignments from "../pages/lecturer/LecturerClassAssignments";
import LecturerClassSettings from "../pages/lecturer/LecturerClassSettings";
import LecturerInsights from "../pages/lecturer/LecturerInsights";
import LecturerStudentDetail from "../pages/lecturer/LecturerStudentDetail";
import StudentManagement from "../pages/lecturer/StudentManagement";
import QuestionReview from "../pages/lecturer/QuestionReview";
import LecturerChat from "../pages/lecturer/LecturerChat";
import LecturerProfile from "../pages/lecturer/LecturerProfile";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminClasses from "../pages/admin/AdminClasses";
import AdminSystem from "../pages/admin/AdminSystem";
import StudentLayout from "../layouts/StudentLayout";
import LecturerLayout from "../layouts/LecturerLayout";
import AdminLayout from "../layouts/AdminLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/student/login"
        element={
          <GuestOnlyRoute>
            <StudentLogin />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/student/register"
        element={
          <GuestOnlyRoute>
            <StudentRegister />
          </GuestOnlyRoute>
        }
      />
      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/classes" element={<StudentClasses />} />
          <Route
            path="/student/classes/:classId"
            element={<StudentClassWorkspace />}
          />
          <Route
            path="/student/classes/:classId/materials"
            element={<StudentClassMaterials />}
          />
          <Route
            path="/student/classes/:classId/assessments/:type"
            element={<StudentClassPretest />}
          />
          <Route
            path="/student/classes/:classId/learning-path"
            element={<StudentClassLearningPath />}
          />
          <Route
            path="/student/classes/:classId/progress"
            element={<StudentClassProgress />}
          />
          <Route
            path="/student/classes/:classId/assignments"
            element={<StudentClassAssignments />}
          />
          <Route
            path="/student/classes/:classId/ai-chat"
            element={<StudentClassAiChat />}
          />
          <Route path="/student/tasks" element={<ComingSoonPage />} />
          <Route path="/student/chat" element={<StudentChat />} />
          <Route path="/student/ask" element={<AskQuestion />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      <Route
        path="/lecturer/login"
        element={
          <GuestOnlyRoute>
            <LecturerLogin />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/lecturer/register"
        element={
          <GuestOnlyRoute>
            <LecturerRegister />
          </GuestOnlyRoute>
        }
      />
      <Route element={<ProtectedRoute role="lecturer" />}>
        <Route element={<LecturerLayout />}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/classes" element={<LecturerClasses />} />
          <Route
            path="/lecturer/classes/new"
            element={<LecturerClassCreate />}
          />
          <Route
            path="/lecturer/classes/:classId"
            element={<LecturerClassWorkspace />}
          />
          <Route
            path="/lecturer/classes/:classId/students"
            element={<StudentManagement />}
          />
          <Route
            path="/lecturer/classes/:classId/materials"
            element={<LecturerClassMaterials />}
          />
          <Route
            path="/lecturer/classes/:classId/assessments/:type"
            element={<LecturerClassPretest />}
          />
          <Route
            path="/lecturer/classes/:classId/progress"
            element={<LecturerClassProgress />}
          />
          <Route
            path="/lecturer/classes/:classId/students/:studentId"
            element={<LecturerStudentDetail />}
          />
          <Route
            path="/lecturer/classes/:classId/assignments"
            element={<LecturerClassAssignments />}
          />
          <Route
            path="/lecturer/classes/:classId/settings"
            element={<LecturerClassSettings />}
          />
          <Route
            path="/lecturer/classes/:classId/insights"
            element={<LecturerInsights />}
          />
          <Route path="/lecturer/questions" element={<QuestionReview />} />
          <Route path="/lecturer/chat" element={<LecturerChat />} />
          <Route path="/lecturer/profile" element={<LecturerProfile />} />
        </Route>
      </Route>

      <Route
        path="/admin/login"
        element={
          <GuestOnlyRoute>
            <AdminLogin />
          </GuestOnlyRoute>
        }
      />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/system" element={<AdminSystem />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
