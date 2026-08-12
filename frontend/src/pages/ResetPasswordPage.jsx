// Shared, role-agnostic "reset password" page reached via the emailed /reset-password/:token link.
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrength from "../components/auth/PasswordStrength";
import AuthButton from "../components/auth/AuthButton";
import FormError from "../components/auth/FormError";
import { resetPassword } from "../services/authService";
import { getPasswordRequirementErrors } from "../utils/password";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function validate() {
    const errors = {};
    if (!password) errors.password = "Password is required.";
    else if (getPasswordRequirementErrors(password).length > 0)
      errors.password = "Your password does not meet all requirements.";
    if (confirmPassword !== password)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setIsDone(true);
    } catch (error) {
      setFormError(
        error.message || "This reset link is invalid or has expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          heading="Set a new password"
          description="Choose a new password for your account."
        />
        {isDone ? (
          <div className="flex flex-col gap-4 text-sm text-[var(--color-text-secondary)]">
            <p>Your password has been reset. You can now sign in.</p>
            <div className="flex flex-col gap-2">
              <Link
                to="/student/login"
                className="font-medium text-[var(--color-text)] hover:underline"
              >
                Sign in as a student
              </Link>
              <Link
                to="/lecturer/login"
                className="font-medium text-[var(--color-text)] hover:underline"
              >
                Sign in as a lecturer
              </Link>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-2">
              <PasswordInput
                label="New password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={fieldErrors.password}
              />
              <PasswordStrength password={password} />
            </div>
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={fieldErrors.confirmPassword}
            />
            <FormError message={formError} />
            <AuthButton
              type="submit"
              loading={isSubmitting}
              loadingLabel="Resetting..."
            >
              Reset password
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
