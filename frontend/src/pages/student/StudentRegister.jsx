import AuthLayout from "../../components/auth/AuthLayout";
import MultiStepAuthForm from "../../components/auth/MultiStepAuthForm";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import StudentPreview from "../../components/auth/previews/StudentPreview";
import { registerStudent } from "../../services/authService";
import { getPasswordRequirementErrors } from "../../utils/password";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const steps = [
  {
    title: "Welcome",
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
    title: "Student Information",
    validate: (values) => {
      const errors = {};
      if (!values.studentId) errors.studentId = "Student ID is required.";
      if (!values.institution) errors.institution = "Institution is required.";
      if (!values.department) errors.department = "Department is required.";
      if (!values.level) errors.level = "Level is required.";
      return errors;
    },
    render: (values, setValue, errors) => (
      <>
        <AuthInput
          label="Student ID"
          value={values.studentId || ""}
          onChange={(event) => setValue("studentId", event.target.value)}
          error={errors.studentId}
        />
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
          label="Level"
          placeholder="e.g. Undergraduate Year 2"
          value={values.level || ""}
          onChange={(event) => setValue("level", event.target.value)}
          error={errors.level}
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
    { label: "Level", value: values.level },
  ];
}

export default function StudentRegister() {
  return (
    <AuthLayout preview={<StudentPreview />}>
      <MultiStepAuthForm
        heading="Create your student account"
        description="Set up your account and begin your personalized learning experience."
        steps={steps}
        confirmationSummary={confirmationSummary}
        submitLabel="Create Student Account"
        onSubmit={registerStudent}
        loginPrompt="Already have an account?"
        loginActionLabel="Sign in"
        loginHref="/student/login"
      />
    </AuthLayout>
  );
}
