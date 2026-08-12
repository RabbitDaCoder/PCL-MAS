import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function AdminLogin() {
  return (
    <AuthLayout>
      <LoginForm role="admin" heading="Administrator Login" />
    </AuthLayout>
  );
}
