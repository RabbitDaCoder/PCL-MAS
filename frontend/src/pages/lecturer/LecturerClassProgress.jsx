// Progress — lecturer view: one row per active student, engagement stats + AI learning profile.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getClassProgress } from "../../services/progressService";
import { reviewLearningPath } from "../../services/learningPathService";

function formatDate(isoDate) {
  if (!isoDate) return "Never";
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LecturerClassProgress() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedbackByStudent, setFeedbackByStudent] = useState({});

  function loadEntries() {
    return getClassProgress(classId).then((data) => setEntries(data));
  }

  useEffect(() => {
    let isMounted = true;
    getClassProgress(classId)
      .then((data) => {
        if (isMounted) setEntries(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load progress.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast]);

  async function handleReview(studentId, decision) {
    setReviewingId(studentId);
    try {
      await reviewLearningPath(classId, {
        studentId,
        decision,
        feedback: feedbackByStudent[studentId],
      });
      showToast(
        decision === "approve"
          ? "Learning path approved — the student can now see it."
          : "Rejected — a new learning path is being generated.",
        "success",
      );
      setFeedbackByStudent((prev) => ({ ...prev, [studentId]: "" }));
      await loadEntries();
    } catch (error) {
      showToast(error.message || "Couldn't review that learning path.");
    } finally {
      setReviewingId(null);
    }
  }

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
        <TrendingUp className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Progress
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : entries.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No active students in this class yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div
              key={entry.studentId}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {entry.firstName} {entry.lastName}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {entry.email}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="!h-8 !px-3 !text-xs"
                  onClick={() =>
                    navigate(
                      `/lecturer/classes/${classId}/students/${entry.studentId}`,
                    )
                  }
                >
                  View full profile
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)] sm:grid-cols-4">
                <p>Messages: {entry.messageCount}</p>
                <p>Questions: {entry.questionCount}</p>
                <p>Joined: {formatDate(entry.joinedAt)}</p>
                <p>Last active: {formatDate(entry.lastActiveAt)}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-secondary)] sm:grid-cols-4">
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
                  Assignments: {entry.assignments.graded}/
                  {entry.assignments.total} graded
                </p>
                <p>
                  Avg. assignment score:{" "}
                  {entry.assignments.averageScore !== null
                    ? `${entry.assignments.averageScore}%`
                    : "—"}
                </p>
              </div>
              {entry.learningProfile ? (
                <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-sm">
                  {typeof entry.learningProfile.lastAssessmentScore ===
                  "number" ? (
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
                  {entry.learningProfile.strengths?.length ? (
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      Strengths: {entry.learningProfile.strengths.join(", ")}
                    </p>
                  ) : null}
                  {entry.learningProfile.weaknesses?.length ? (
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      Weak topics: {entry.learningProfile.weaknesses.join(", ")}
                    </p>
                  ) : null}
                  {entry.learningProfile.recommendedTopics?.length ? (
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      Recommended topics:{" "}
                      {entry.learningProfile.recommendedTopics.join(", ")}
                    </p>
                  ) : null}
                  {entry.learningProfile.learningPathSteps?.length ? (
                    <div className="mt-2 flex items-center gap-2">
                      {entry.learningProfile.reviewStatus === "pending" ? (
                        <div className="flex w-full flex-col gap-2">
                          <span className="w-fit rounded-full border border-[var(--color-accent)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                            AI learning path awaiting review
                          </span>
                          <input
                            value={feedbackByStudent[entry.studentId] ?? ""}
                            onChange={(event) =>
                              setFeedbackByStudent((prev) => ({
                                ...prev,
                                [entry.studentId]: event.target.value,
                              }))
                            }
                            placeholder="Feedback (optional)"
                            className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              className="!h-8 !px-3 !text-xs"
                              isLoading={reviewingId === entry.studentId}
                              onClick={() =>
                                handleReview(entry.studentId, "approve")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              className="!h-8 !px-3 !text-xs"
                              isLoading={reviewingId === entry.studentId}
                              onClick={() =>
                                handleReview(entry.studentId, "reject")
                              }
                            >
                              Reject &amp; regenerate
                            </Button>
                          </div>
                        </div>
                      ) : entry.learningProfile.reviewStatus === "approved" ? (
                        <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                          Learning path approved
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-secondary)]">
                  No AI learning profile yet — student hasn't generated a
                  learning path.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
