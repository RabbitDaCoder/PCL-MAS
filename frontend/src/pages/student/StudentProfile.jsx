// Student profile — view + edit name only; email and studentId are read-only; password
// change and logout are separate, clearly-labeled actions (not bundled into this form).
import { useState } from "react";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateStudentProfile } from "../../services/studentService";
import { forgotPassword } from "../../services/authService";

function validate(values) {
  const errors = {};
  if (!values.firstName) errors.firstName = "First name is required.";
  if (!values.lastName) errors.lastName = "Last name is required.";
  return errors;
}

export default function StudentProfile() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function startEditing() {
    setValues({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
    setErrors({});
    setIsEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updated = await updateStudentProfile(values);
      updateUser(updated);
      showToast("Profile updated.", "success");
      setIsEditing(false);
    } catch (error) {
      showToast(error.message || "Couldn't save your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const message = await forgotPassword(user.email);
      showToast(
        message || "Check your email to reset your password.",
        "success",
      );
    } catch (error) {
      showToast(error.message || "Couldn't start the password reset.");
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Profile
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Your account details.
        </p>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="flex max-w-md flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <AuthInput
            label="First name"
            value={values.firstName}
            onChange={(event) => setValue("firstName", event.target.value)}
            error={errors.firstName}
          />
          <AuthInput
            label="Last name"
            value={values.lastName}
            onChange={(event) => setValue("lastName", event.target.value)}
            error={errors.lastName}
          />
          <div className="mt-2 flex gap-3">
            <Button
              type="submit"
              variant="primary"
              className="h-11 px-6 text-sm"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 px-6 text-sm"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex max-w-md flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">Name</p>
            <p className="text-sm text-[var(--color-text)]">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">Email</p>
            <p className="text-sm text-[var(--color-text)]">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Student ID
            </p>
            <p className="text-sm text-[var(--color-text)]">
              {user?.studentId || "—"}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 h-11 w-fit px-6 text-sm"
            onClick={startEditing}
          >
            Edit profile
          </Button>
        </div>
      )}

      <div className="flex max-w-md flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm font-medium text-[var(--color-text)]">Security</p>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-fit px-6 text-sm"
          onClick={handleChangePassword}
          disabled={isSendingReset}
        >
          {isSendingReset ? "Sending…" : "Change password"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-fit px-6 text-sm"
          onClick={logout}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
