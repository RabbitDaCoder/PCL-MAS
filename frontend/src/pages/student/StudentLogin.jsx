import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
import StudentPreview from "../../components/auth/previews/StudentPreview";

export default function StudentLogin() {
  return (
    <AuthLayout preview={<StudentPreview />}>
      <LoginForm
        role="student"
        heading="Welcome back"
        description="Continue your personalized learning journey."
        registerPrompt="Don't have a student account?"
        registerActionLabel="Create student account"
        registerHref="/student/register"
      />
    </AuthLayout>
  );
}
