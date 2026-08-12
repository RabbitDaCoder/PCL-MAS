// Step 4 — Review & Create: read-only summary of every prior step, each section with an Edit
// link that jumps the wizard back to that step.
import { Pencil } from "lucide-react";

function ReviewSection({ title, stepNumber, onEditStep, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--color-text)]">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onEditStep(stepNumber)}
          className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text)]">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="w-40 shrink-0 text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}

export default function StepReview({ values, onEditStep }) {
  const objectives = values.learningObjectives.filter(Boolean);
  const topics = values.topics.filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <ReviewSection
        title="Basic Information"
        stepNumber={1}
        onEditStep={onEditStep}
      >
        <Row label="Class name" value={values.name} />
        <Row label="Course code" value={values.courseCode} />
        <Row label="Department" value={values.department} />
        <Row label="Level" value={values.level} />
        <Row label="Semester" value={values.semester} />
        <Row label="Academic session" value={values.academicSession} />
      </ReviewSection>

      <ReviewSection
        title="Course Details"
        stepNumber={2}
        onEditStep={onEditStep}
      >
        <Row label="Description" value={values.description} />
        <Row
          label="Learning objectives"
          value={objectives.length ? `${objectives.length} added` : ""}
        />
        <Row
          label="Topics"
          value={topics.length ? `${topics.length} added` : ""}
        />
      </ReviewSection>

      <ReviewSection
        title="Class Settings"
        stepNumber={3}
        onEditStep={onEditStep}
      >
        <Row label="Start date" value={values.startDate} />
        <Row label="End date" value={values.endDate} />
        <Row
          label="Enrollment"
          value={
            values.enrollmentMode === "approval"
              ? "Lecturer approval"
              : "Join with code"
          }
        />
        {values.enrollmentMode === "code" ? (
          <Row label="Class code" value={values.classCode} />
        ) : null}
        <Row label="Max students" value={values.maxStudents} />
      </ReviewSection>
    </div>
  );
}
