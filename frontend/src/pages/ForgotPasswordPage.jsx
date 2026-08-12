// Shared, role-agnostic "forgot password" request page — the backend never reveals whether an
// email is registered, so this always shows the same generic confirmation state.
import { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import FormError from "../components/auth/FormError";
import { forgotPassword } from "../services/authService";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email) {
      setFieldError("Email address is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError("");
    setFormError("");
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      setFormError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          heading="Reset your password"
          description="Enter the email on your account and we'll send you a reset link."
        />
        {isSent ? (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            If that email is registered, a password reset link is on its way.
            Check your inbox.
          </p>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <AuthInput
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldError}
            />
            <FormError message={formError} />
            <AuthButton
              type="submit"
              loading={isSubmitting}
              loadingLabel="Sending..."
            >
              Send reset link
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
