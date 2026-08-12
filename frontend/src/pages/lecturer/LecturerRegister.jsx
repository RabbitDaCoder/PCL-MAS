import AuthLayout from "../../components/auth/AuthLayout";
import MultiStepAuthForm from "../../components/auth/MultiStepAuthForm";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import LecturerPreview from "../../components/auth/previews/LecturerPreview";
import { registerLecturer } from "../../services/authService";
import { getPasswordRequirementErrors } from "../../utils/password";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const steps = [
  {
    title: "Personal Information",
    validate: (values) => {
      const errors = {};
      if (!values.firstName) errors.firstName = "First name is required.";
      if (!values.lastName) errors.lastName = "Last name is required.";
      return errors;
    },
    render: (values, setValue, errors) => (
      <>
        <AuthInput
          label="First name"
          autoComplete="given-name"
          value={values.firstName || ""}
          onChange={(event) => setValue("firstName", event.target.value)}
          error={errors.firstName}
        />
        <AuthInput
          label="Last name"
          autoComplete="family-name"
          value={values.lastName || ""}
          onChange={(event) => setValue("lastName", event.target.value)}
          error={errors.lastName}
        />
      </>
    ),
  },
  {
    title: "Account",
    validate: (values) => {
      const errors = {};
      if (!values.email) errors.email = "Email address is required.";
      else if (!isValidEmail(values.email))
        errors.email = "Enter a valid email address.";

      if (!values.password) errors.password = "Password is required.";
      else if (getPasswordRequirementErrors(values.password).length > 0) {
        errors.password = "Your password does not meet all requirements.";
      }

      if (values.confirmPassword !== values.password)
        errors.confirmPassword = "Passwords do not match.";
      return errors;
    },
    render: (values, setValue, errors) => (
      <>
        <AuthInput
          label="Email address"
          type="email"
          autoComplete="email"
          value={values.email || ""}
          onChange={(event) => setValue("email", event.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            value={values.password || ""}
            onChange={(event) => setValue("password", event.target.value)}
            error={errors.password}
          />
          <PasswordStrength password={values.password || ""} />
        </div>
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword || ""}
          onChange={(event) => setValue("confirmPassword", event.target.value)}
          error={errors.confirmPassword}
        />
      </>
    ),
  },
  {
    title: "Professional Information",
    validate: (values) => {
      const errors = {};
      if (!values.institution) errors.institution = "Institution is required.";
      if (!values.department) errors.department = "Department is required.";
      if (!values.faculty) errors.faculty = "Faculty is required.";
      if (!values.academicRole)
        errors.academicRole = "Academic role is required.";
      return errors;
    },
    render: (values, setValue, errors) => (
      <>
        <AuthInput
          label="Institution / University"
          value={values.institution || ""}
          onChange={(event) => setValue("institution", event.target.value)}
          error={errors.institution}
        />
        <AuthInput
          label="Department"
          value={values.department || ""}
          onChange={(event) => setValue("department", event.target.value)}
          error={errors.department}
        />
        <AuthInput
          label="Faculty"
          value={values.faculty || ""}
          onChange={(event) => setValue("faculty", event.target.value)}
          error={errors.faculty}
        />
        <AuthInput
          label="Academic role"
          placeholder="e.g. Senior Lecturer"
          value={values.academicRole || ""}
          onChange={(event) => setValue("academicRole", event.target.value)}
          error={errors.academicRole}
        />
      </>
    ),
  },
];

function confirmationSummary(values) {
  return [
    {
      label: "Name",
      value: `${values.firstName || ""} ${values.lastName || ""}`.trim(),
    },
    { label: "Email", value: values.email },
    { label: "Institution", value: values.institution },
    { label: "Department", value: values.department },
    { label: "Faculty", value: values.faculty },
    { label: "Academic role", value: values.academicRole },
  ];
}

export default function LecturerRegister() {
  return (
    <AuthLayout preview={<LecturerPreview />}>
      <MultiStepAuthForm
        heading="Create your lecturer account"
        description="Create classes, manage learning materials, and work with your AI learning team."
        steps={steps}
        confirmationSummary={confirmationSummary}
        submitLabel="Create Lecturer Account"
        onSubmit={registerLecturer}
        loginPrompt="Already have an account?"
        loginActionLabel="Sign in"
        loginHref="/lecturer/login"
      />
    </AuthLayout>
  );
}
