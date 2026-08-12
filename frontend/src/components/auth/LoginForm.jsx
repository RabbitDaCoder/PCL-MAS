// Generic login form shared by student, lecturer, and admin login pages; role-specific copy is passed in as props.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import AuthButton from "./AuthButton";
import AuthFooter from "./AuthFooter";
import FormError from "./FormError";
import { getDashboardPath } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Lets an admin type their email on any login page instead of remembering the /admin/login URL.
const ADMIN_EMAIL = "admin@pcl-mas.com";

export default function LoginForm({
  role,
  heading,
  description,
  forgotPasswordHref = "/forgot-password",
  registerPrompt,
  registerActionLabel,
  registerHref,
  roleSwitchPrompt,
  roleSwitchActionLabel,
  roleSwitchHref,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!email) errors.email = "Email address is required.";
    else if (!isValidEmail(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    if (role !== "admin" && email.trim().toLowerCase() === ADMIN_EMAIL) {
      navigate("/admin/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ role, email, password });
      navigate(getDashboardPath(user.role));
    } catch (error) {
      setFormError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <AuthHeader heading={heading} description={description} />
      {location.state?.registered ? (
        <p
          role="status"
          className="mb-5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-success)]"
        >
          Account created. Sign in below to continue.
        </p>
      ) : null}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          <a
            href={forgotPasswordHref}
            className="self-end text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            Forgot password?
          </a>
        </div>
        <FormError message={formError} />
        <AuthButton
          type="submit"
          loading={isSubmitting}
          loadingLabel="Signing in..."
        >
          Sign In
        </AuthButton>
      </form>

      {registerHref || roleSwitchHref ? (
        <div className="mt-6 flex flex-col gap-3">
          {registerHref ? (
            <AuthFooter
              prompt={registerPrompt}
              actionLabel={registerActionLabel}
              to={registerHref}
            />
          ) : null}
          {roleSwitchHref ? (
            <AuthFooter
              prompt={roleSwitchPrompt}
              actionLabel={roleSwitchActionLabel}
              to={roleSwitchHref}
            />
          ) : null}
        </div>
      ) : null}
    </AuthCard>
  );
}
