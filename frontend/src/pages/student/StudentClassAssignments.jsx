// Assignments — student view: list of tasks with status; expand to submit text/file, or view
// score/feedback once graded.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Send,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  getMyAssignments,
  submitAssignment,
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

function SubmitForm({ assignment, onSubmitted }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [text, setText] = useState(assignment.submissionText || "");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() && !file) {
      showToast("Write something or attach a file first.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitAssignment(assignment.id, { text: text.trim(), file });
      showToast("Assignment submitted.", "success");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await onSubmitted();
    } catch (error) {
      showToast(error.message || "Couldn't submit that assignment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="Write your submission here…"
        className="rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm text-[var(--color-text)]"
        />
        <Button type="submit" isLoading={isSubmitting} className="ml-auto">
          <Send className="h-4 w-4" />
          {assignment.status === "pending" ? "Submit" : "Re-submit"}
        </Button>
      </div>
    </form>
  );
}

export default function StudentClassAssignments() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  function loadAssignments() {
    return getMyAssignments(classId).then((data) => setAssignments(data));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getMyAssignments(classId)
      .then((data) => {
        if (isMounted) setAssignments(data);
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

  const hasAssignments = assignments.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(`/student/classes/${classId}`)}
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

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasAssignments ? (
        <ul className="flex flex-col gap-3">
          {assignments.map((assignment) => {
            const isExpanded = expandedId === assignment.id;
            return (
              <li
                key={assignment.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : assignment.id)
                  }
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {assignment.title}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {assignment.dueDate
                        ? `Due ${formatDate(assignment.dueDate)}`
                        : "No due date"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[assignment.status] ??
                        STATUS_STYLES.pending
                      }`}
                    >
                      {assignment.status.replace("_", " ")}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                </button>

                {isExpanded ? (
                  <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
                    {assignment.description ? (
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {assignment.description}
                      </p>
                    ) : null}
                    {assignment.instructions ? (
                      <p className="text-sm text-[var(--color-text)]">
                        {assignment.instructions}
                      </p>
                    ) : null}

                    {assignment.status === "graded" ? (
                      <div className="rounded-xl bg-[var(--color-hover)] p-3">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          Score: {assignment.score}%
                        </p>
                        {assignment.feedback ? (
                          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            {assignment.feedback}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <SubmitForm
                        assignment={assignment}
                        onSubmitted={loadAssignments}
                      />
                    )}

                    {assignment.submissionFileUrl ? (
                      <a
                        href={assignment.submissionFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-fit items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5" /> View submitted
                        file
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No assignments yet.
        </p>
      )}
    </div>
  );
}
