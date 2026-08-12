// Progress — student view: their own engagement stats + AI learning profile summary.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getMyProgress } from "../../services/progressService";

function formatDate(isoDate) {
  if (!isoDate) return "Never";
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StudentClassProgress() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMyProgress(classId)
      .then((data) => {
        if (isMounted) setEntry(data);
      })
      .catch((error) => {
        if (isMounted)
          showToast(error.message || "Couldn't load your progress.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast]);

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
        <TrendingUp className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          My Progress
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full max-w-lg" />
      ) : !entry ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No progress data yet.
        </p>
      ) : (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
            <p>Messages sent: {entry.messageCount}</p>
            <p>Questions asked: {entry.questionCount}</p>
            <p>Joined: {formatDate(entry.joinedAt)}</p>
            <p>Last active: {formatDate(entry.lastActiveAt)}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-secondary)]">
            <p>
              Pre-test:{" "}
              {entry.assessments.preTest
                ? entry.assessments.preTest.status === "completed"
                  ? `${entry.assessments.preTest.score}%`
                  : entry.assessments.preTest.status.replace("_", " ")
                : "Not started"}
            </p>
            <p>
              Post-test:{" "}
              {entry.assessments.postTest
                ? entry.assessments.postTest.status === "completed"
                  ? `${entry.assessments.postTest.score}%`
                  : entry.assessments.postTest.status.replace("_", " ")
                : "Not started"}
            </p>
            <p>
              Assignments: {entry.assignments.graded}/{entry.assignments.total}{" "}
              graded
            </p>
            <p>
              Avg. score:{" "}
              {entry.assignments.averageScore !== null
                ? `${entry.assignments.averageScore}%`
                : "—"}
            </p>
          </div>
          {entry.learningProfile ? (
            <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-sm">
              {typeof entry.learningProfile.lastAssessmentScore === "number" ? (
                <p className="text-[var(--color-text)]">
                  Pre-test score:{" "}
                  <span className="font-medium">
                    {entry.learningProfile.lastAssessmentScore}%
                  </span>
                </p>
              ) : null}
              {entry.learningProfile.progressSummary ? (
                <p className="mt-1 text-[var(--color-text-secondary)]">
                  {entry.learningProfile.progressSummary}
                </p>
              ) : null}
              <Button
                className="mt-4"
                onClick={() =>
                  navigate(`/student/classes/${classId}/learning-path`)
                }
              >
                View my learning path
              </Button>
            </div>
          ) : (
            <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-secondary)]">
              Complete your pre-test and generate a learning path to see AI
              insights here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
