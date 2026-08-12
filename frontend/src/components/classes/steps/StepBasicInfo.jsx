// Step 1 — Basic Information: name, course code, department (pre-filled from lecturer profile),
// academic level, semester, session.
import AuthInput from "../../auth/AuthInput";
import SelectField from "../SelectField";
import { ACADEMIC_LEVELS, SEMESTERS } from "../../../data/academicOptions";

export default function StepBasicInfo({ values, setValue, errors }) {
  return (
    <div className="flex flex-col gap-5">
      <AuthInput
        label="Class name"
        placeholder="Introduction to Computer Science"
        value={values.name}
        onChange={(event) => setValue("name", event.target.value)}
        error={errors.name}
      />
      <AuthInput
        label="Course code"
        placeholder="CSC 201"
        value={values.courseCode}
        onChange={(event) => setValue("courseCode", event.target.value)}
        error={errors.courseCode}
      />
      <AuthInput
        label="Department"
        placeholder="Computer Science"
        value={values.department}
        onChange={(event) => setValue("department", event.target.value)}
        error={errors.department}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Academic level"
          value={values.level}
          onChange={(event) => setValue("level", event.target.value)}
          error={errors.level}
        >
          <option value="" disabled>
            Select level
          </option>
          {ACADEMIC_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Semester"
          value={values.semester}
          onChange={(event) => setValue("semester", event.target.value)}
          error={errors.semester}
        >
          <option value="" disabled>
            Select semester
          </option>
          {SEMESTERS.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </SelectField>
      </div>
      <AuthInput
        label="Academic session"
        placeholder="2026/2027"
        value={values.academicSession}
        onChange={(event) => setValue("academicSession", event.target.value)}
        error={errors.academicSession}
      />
    </div>
  );
}
