// Password requirement rules shared by PasswordStrength (display) and registration step validation.
export const PASSWORD_REQUIREMENTS = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  { key: "number", label: "One number", test: (value) => /[0-9]/.test(value) },
  {
    key: "special",
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export function getPasswordRequirementErrors(password) {
  return PASSWORD_REQUIREMENTS.filter(
    (requirement) => !requirement.test(password),
  ).map((requirement) => requirement.label);
}
