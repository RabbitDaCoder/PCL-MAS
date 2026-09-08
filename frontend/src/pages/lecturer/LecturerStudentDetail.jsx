// Student Detail — lecturer's deep-dive view of ONE student: analytics, personalization records
// (including version history), AI interaction patterns, and a before/after intervention
// comparison. The per-student destination the audit found was missing (LecturerClassProgress.jsx
// only ever showed a dense list row, not a dedicated page).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getStudentDetail } from "../../services/progressService";

function formatDate(isoDate) {
  if (!isoDate) return "Never";
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
        {title}
      </h2>
      <div className="mt-3 text-sm text-[var(--color-text)]">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="font-medium text-[var(--color-text)]">{value}</p>
    </div>
  );
}

export default function LecturerStudentDetail() {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getStudentDetail(classId, studentId)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load this student.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, studentId, showToast]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(`/lecturer/classes/${classId}/progress`)}
        className="flex w-fit items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to progress
      </button>

      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-3xl" />
      ) : !detail ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Couldn't load this student's data.
        </p>
      ) : (
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text)]">
                {detail.firstName} {detail.lastName}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {detail.email}
              </p>
            </div>
          </div>

          <Section title="Learning analytics">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Stat label="Joined" value={formatDate(detail.joinedAt)} />
              <Stat label="Last login" value={formatDate(detail.lastLoginAt)} />
              <Stat label="Total logins" value={detail.loginCount} />
              <Stat label="Messages sent" value={detail.messageCount} />
              <Stat label="Questions submitted" value={detail.questionCount} />
              <Stat
                label="Last active"
                value={formatDate(
                  [detail.lastMessageAt, detail.lastQuestionAt]
                    .filter(Boolean)
                    .sort((a, b) => new Date(b) - new Date(a))[0],
                )}
              />
            </div>
          </Section>

          <Section title="Pre-test / post-test performance">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Stat
                label="Pre-test"
                value={
                  detail.assessments.preTest
                    ? `${detail.assessments.preTest.score ?? "—"}%`
                    : "Not started"
                }
              />
              <Stat
                label="Pre-test duration"
                value={
                  detail.assessments.preTest?.durationMinutes != null
                    ? `${detail.assessments.preTest.durationMinutes} min`
                    : "—"
                }
              />
              <Stat
                label="Post-test"
                value={
                  detail.assessments.postTest
                    ? `${detail.assessments.postTest.score ?? "—"}%`
                    : "Not started"
                }
              />
              <Stat
                label="Post-test duration"
                value={
                  detail.assessments.postTest?.durationMinutes != null
                    ? `${detail.assessments.postTest.durationMinutes} min`
                    : "—"
                }
              />
            </div>
            <div className="mt-4 border-t border-[var(--color-border)] pt-3">
              {detail.improvement.delta === null ? (
                <p className="text-[var(--color-text-secondary)]">
                  Improvement not available yet — post-test not taken.
                </p>
              ) : (
                <p>
                  {detail.improvement.hasImproved ? "Improved by " : "Changed by "}
                  <span className="font-medium">
                    {detail.improvement.delta > 0 ? "+" : ""}
                    {detail.improvement.delta} points
                  </span>{" "}
                  since the pre-test.
                </p>
              )}
            </div>
          </Section>

          <Section title="Assignments">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Stat
                label="Graded"
                value={`${detail.assignments.graded}/${detail.assignments.total}`}
              />
              <Stat label="Submitted" value={detail.assignments.submitted} />
              <Stat
                label="Average score"
                value={
                  detail.assignments.averageScore !== null
                    ? `${detail.assignments.averageScore}%`
                    : "—"
                }
              />
            </div>
          </Section>

          <Section title="Personalization record">
            {detail.learningProfile ? (
              <div className="flex flex-col gap-2">
                {detail.learningProfile.progressSummary ? (
                  <p>{detail.learningProfile.progressSummary}</p>
                ) : null}
                {detail.learningProfile.strengths?.length ? (
                  <p className="text-[var(--color-text-secondary)]">
                    Strengths: {detail.learningProfile.strengths.join(", ")}
                  </p>
                ) : null}
                {detail.learningProfile.weaknesses?.length ? (
                  <p className="text-[var(--color-text-secondary)]">
                    Weaknesses: {detail.learningProfile.weaknesses.join(", ")}
                  </p>
                ) : null}
                {detail.learningProfile.knowledgeGaps?.length ? (
                  <p className="text-[var(--color-text-secondary)]">
                    Critical knowledge gaps:{" "}
                    {detail.learningProfile.knowledgeGaps.join(", ")}
                  </p>
                ) : null}
                {detail.learningProfile.learningPace ? (
                  <p className="text-[var(--color-text-secondary)]">
                    Pre-test pace: {detail.learningProfile.learningPace}
                  </p>
                ) : null}
                {detail.learningProfile.recommendedTopics?.length ? (
                  <p className="text-[var(--color-text-secondary)]">
                    Recommended topics:{" "}
                    {detail.learningProfile.recommendedTopics.join(", ")}
                  </p>
                ) : null}

                {detail.learningProfile.learningPathSteps?.length ? (
                  <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Current learning path
                      </span>
                      <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--color-text-secondary)]">
                        {detail.learningProfile.reviewStatus ?? "pending"}
                      </span>
                    </div>
                    {detail.learningProfile.learningPathSteps.map((step, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{step.topic}</span>
                        {" — "}
                        <span className="text-[var(--color-text-secondary)]">
                          {step.priority} priority: {step.recommendation}
                        </span>
                      </div>
                    ))}
                    {detail.learningProfile.reviewFeedback ? (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Lecturer feedback: "{detail.learningProfile.reviewFeedback}"
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {detail.learningProfile.history?.length ? (
                  <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Previous versions ({detail.learningProfile.history.length})
                    </span>
                    {[...detail.learningProfile.history]
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-[var(--color-border)] p-3 text-xs text-[var(--color-text-secondary)]"
                        >
                          <p className="text-[var(--color-text)]">
                            Replaced {formatDate(entry.replacedAt)} ·{" "}
                            {entry.reviewStatus ?? "pending"}
                          </p>
                          {entry.summary ? <p className="mt-1">{entry.summary}</p> : null}
                          {entry.weaknesses?.length ? (
                            <p className="mt-1">
                              Weak topics then: {entry.weaknesses.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-[var(--color-text-secondary)]">
                No AI learning profile yet — student hasn't generated a learning path.
              </p>
            )}
          </Section>

          <Section title="AI interactions">
            {detail.aiInteractions.total === 0 ? (
              <p className="text-[var(--color-text-secondary)]">
                No AI interactions logged yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(detail.aiInteractions.byAgent).map(
                    ([agent, count]) => (
                      <span
                        key={agent}
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium capitalize text-[var(--color-text-secondary)]"
                      >
                        {agent}: {count}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                  {detail.aiInteractions.recent.slice(0, 10).map((interaction, index) => (
                    <div key={index} className="text-xs">
                      <p className="text-[var(--color-text-secondary)]">
                        {formatDate(interaction.createdAt)} ·{" "}
                        <span className="capitalize">{interaction.agentType}</span>
                      </p>
                      <p className="mt-0.5 text-[var(--color-text)]">
                        {interaction.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
