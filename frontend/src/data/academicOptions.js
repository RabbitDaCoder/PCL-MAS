// Fixed option lists for class setup — not sourced from the backend (no academic-level config
// there yet), so this is the one place both the wizard and its validation reference.
export const ACADEMIC_LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "Postgraduate",
];

export const SEMESTERS = ["First Semester", "Second Semester"];

export const ENROLLMENT_MODES = [
  {
    value: "code",
    label: "Join with class code",
    description: "Students enter a code to join instantly.",
  },
  {
    value: "approval",
    label: "Lecturer approval",
    description: "Students request to join; you approve each one.",
  },
];
