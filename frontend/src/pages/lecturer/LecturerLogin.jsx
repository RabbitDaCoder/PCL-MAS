import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
import LecturerPreview from "../../components/auth/previews/LecturerPreview";

export default function LecturerLogin() {
  return (
    <AuthLayout preview={<LecturerPreview />}>
      <LoginForm
        role="lecturer"
        heading="Welcome back, Lecturer"
        description="Manage your classes, guide students, and work with your AI learning team."
        registerPrompt="Don't have a lecturer account?"
        registerActionLabel="Create lecturer account"
        registerHref="/lecturer/register"
        roleSwitchPrompt="Are you a student?"
        roleSwitchActionLabel="Student Login"
        roleSwitchHref="/student/login"
      />
    </AuthLayout>
  );
}
