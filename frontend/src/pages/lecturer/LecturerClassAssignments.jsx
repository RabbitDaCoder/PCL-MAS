// Assignments — lecturer view: create form + list of assignments with per-student status and
// inline grading for submitted work.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ListChecks,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  createAssignment,
  getClassAssignments,
  gradeAssignment,
} from "../../services/assignmentService";

const STATUS_STYLES = {
  pending: "bg-[var(--color-hover)] text-[var(--color-text-secondary)]",
  in_progress: "bg-[var(--color-hover)] text-[var(--color-text-secondary)]",
  submitted: "bg-amber-500/15 text-amber-600",
  graded: "bg-emerald-500/15 text-emerald-600",
};

function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GradeForm({ student, onGrade }) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    const numericScore = Number(score);
    if (
      score === "" ||
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      showToast("Enter a score between 0 and 100.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onGrade(student.assignmentId, { score: numericScore, feedback });
    } catch (error) {
      showToast(error.message || "Couldn't grade this submission.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min="0"
        max="100"
        value={score}
        onChange={(event) => setScore(event.target.value)}
        placeholder="Score"
        className="h-9 w-20 rounded-[10px] border border-[var(--color-border)] bg-transparent px-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
      />
      <input
        type="text"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Feedback (optional)"
        className="h-9 min-w-[160px] flex-1 rounded-[10px] border border-[var(--color-border)] bg-transparent px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
      />
      <Button
        type="submit"
        isLoading={isSubmitting}
        className="h-9 px-3 text-xs"
      >
        Grade
      </Button>
    </form>
  );
}

export default function LecturerClassAssignments() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  function loadAssignments() {
    return getClassAssignments(classId).then((data) => setGroups(data));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getClassAssignments(classId)
      .then((data) => {
        if (isMounted) setGroups(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load assignments.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function validate() {
    const next = {};
    if (!title.trim()) next.title = "A title is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!validate()) return;
    setIsCreating(true);
    try {
      await createAssignment(classId, {
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      showToast("Assignment created.", "success");
      setTitle("");
      setDescription("");
      setInstructions("");
      setDueDate("");
      await loadAssignments();
    } catch (error) {
      showToast(error.message || "Couldn't create that assignment.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleGrade(assignmentId, fields) {
    await gradeAssignment(assignmentId, fields);
    showToast("Submission graded.", "success");
    await loadAssignments();
  }

  const hasGroups = groups.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(`/lecturer/classes/${classId}`)}
        className="flex w-fit items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to class
      </button>

      <div className="flex items-center gap-3">
        <ListChecks className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Assignments
        </h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex max-w-lg flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <h2 className="text-sm font-medium text-[var(--color-text)]">
          Create an assignment
        </h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-11 rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            placeholder="e.g. Essay: Chapter 3 reflection"
          />
          {errors.title ? (
            <span className="text-xs text-[var(--color-error)]">
              {errors.title}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Instructions (optional)
          </label>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={2}
            className="rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="min-h-11 rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <Button type="submit" isLoading={isCreating} className="w-fit">
          <Plus className="h-4 w-4" /> Create assignment
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasGroups ? (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => {
            const isExpanded = expandedGroup === group.groupId;
            return (
              <li
                key={group.groupId}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroup(isExpanded ? null : group.groupId)
                  }
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {group.title}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {group.submittedCount}/{group.totalStudents} submitted
                      {group.dueDate
                        ? ` · Due ${formatDate(group.dueDate)}`
                        : ""}
                      {group.averageScore !== null
                        ? ` · Avg score ${group.averageScore}%`
                        : ""}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
                  )}
                </button>

                {isExpanded ? (
                  <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
                    {group.description ? (
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {group.description}
                      </p>
                    ) : null}
                    <ul className="flex flex-col gap-2">
                      {group.students.map((student) => (
                        <li
                          key={student.assignmentId}
                          className="flex flex-col gap-2 rounded-xl bg-[var(--color-hover)] p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--color-text)]">
                              {student.firstName} {student.lastName}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                STATUS_STYLES[student.status] ??
                                STATUS_STYLES.pending
                              }`}
                            >
                              {student.status.replace("_", " ")}
                            </span>
                            {student.score !== null ? (
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                Score: {student.score}%
                              </span>
                            ) : null}
                          </div>
                          {student.status === "submitted" ? (
                            <GradeForm
                              student={student}
                              onGrade={handleGrade}
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No assignments created yet.
        </p>
      )}
    </div>
  );
}
