// Question Review — filter tabs, list of questions across all the lecturer's classes, and a
// detail panel to respond/approve/reject.
import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  getQuestions,
  respondToQuestion,
} from "../../services/questionService";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "answered", label: "Answered" },
  { key: "rejected", label: "Rejected" },
];

const EMPTY_MESSAGES = {
  all: "No questions yet at all.",
  pending: "No pending questions.",
  answered: "No answered questions yet.",
  rejected: "No rejected questions.",
};

export default function QuestionReview() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load(tab) {
    setIsLoading(true);
    return getQuestions(tab)
      .then((data) => setQuestions(data))
      .catch((error) => showToast(error.message || "Couldn't load questions."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getQuestions(activeTab)
      .then((data) => {
        if (isMounted) setQuestions(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load questions.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const selected =
    questions.find((question) => question.id === selectedId) ?? null;

  function selectQuestion(question) {
    setSelectedId(question.id);
    setResponseText(question.lecturerResponse || "");
  }

  async function handleRespond(status) {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await respondToQuestion(selected.id, {
        status,
        lecturerResponse: responseText,
      });
      showToast(
        status === "answered" ? "Response sent." : "Question rejected.",
        "success",
      );
      setSelectedId(null);
      await load(activeTab);
    } catch (error) {
      showToast(error.message || "Couldn't update the question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasQuestions = questions.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Question review
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Respond to questions from students across your classes.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedId(null);
            }}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[var(--color-text)] text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : hasQuestions ? (
          <div className="flex flex-col gap-2">
            {questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => selectQuestion(question)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  selectedId === question.id
                    ? "border-[var(--color-text)] bg-[var(--color-hover)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-hover)]"
                }`}
              >
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {question.studentName} · {question.className}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                  {question.questionText}
                </p>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {question.status} ·{" "}
                  {new Date(question.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
            <p className="mt-3 text-[var(--color-text)]">
              {EMPTY_MESSAGES[activeTab]}
            </p>
          </div>
        )}

        {selected ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {selected.studentName} · {selected.className}
            </p>
            <p className="mt-3 text-sm text-[var(--color-text)]">
              {selected.questionText}
            </p>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text)]">
                Response
              </span>
              <textarea
                rows={4}
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus-visible:border-[var(--color-text)]"
                placeholder="Write your response…"
              />
            </label>
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="primary"
                className="h-10 px-4 text-sm"
                onClick={() => handleRespond("answered")}
                disabled={isSubmitting}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 px-4 text-sm"
                onClick={() => handleRespond("rejected")}
                disabled={isSubmitting}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
