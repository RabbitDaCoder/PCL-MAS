// Ask a Question — human-in-the-loop: student submits a question to one of their active
// classes, then it appears in the list below flagged "pending" until the lecturer responds.
// Listens for the `classes` socket namespace's `question:answered` event so a response appears
// live, without a refresh.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import { getMyClasses } from "../../services/classService";
import { submitQuestion, getMyQuestions } from "../../services/questionService";

const STATUS_LABEL = {
  pending: "Pending review",
  answered: "Answered",
  rejected: "Rejected",
};

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-800",
  answered: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AskQuestion() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMyClasses(), getMyQuestions()])
      .then(([classesData, questionsData]) => {
        if (!isMounted) return;
        setClasses(classesData);
        setQuestions(questionsData);
        const preselect = searchParams.get("classId");
        if (preselect && classesData.some((cls) => cls.id === preselect)) {
          setSelectedClassId(preselect);
        } else if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id);
        }
      })
      .catch((error_) =>
        showToast(error_.message || "Couldn't load your data."),
      )
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket("/classes");
    if (!socket) return undefined;

    function handleAnswered(question) {
      setQuestions((prev) => {
        const exists = prev.some((existing) => existing.id === question.id);
        if (exists) {
          return prev.map((existing) =>
            existing.id === question.id
              ? { ...existing, ...question }
              : existing,
          );
        }
        return [question, ...prev];
      });
    }

    socket.on("question:answered", handleAnswered);
    return () => socket.off("question:answered", handleAnswered);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedClassId) {
      setError("Select a class first.");
      return;
    }
    if (!questionText.trim()) {
      setError("Enter your question.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const created = await submitQuestion({
        classId: selectedClassId,
        questionText: questionText.trim(),
      });
      setQuestions((prev) => [created, ...prev]);
      setQuestionText("");
      showToast("Question submitted.", "success");
    } catch (error_) {
      showToast(error_.message || "Couldn't submit your question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasClasses = classes.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Ask a question
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          A real person reviews every question — you'll see the response here.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : hasClasses ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ask-class"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Class
            </label>
            <select
              id="ask-class"
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="min-h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none focus-visible:border-[var(--color-text)]"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ask-text"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Your question
            </label>
            <textarea
              id="ask-text"
              rows={4}
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="What would you like to ask?"
              className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none focus-visible:border-[var(--color-text)]"
            />
            {error ? (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="h-11 w-fit px-6 text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit question"}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-3 text-[var(--color-text)]">
            Join a class before asking a question.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Your questions
        </h2>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : questions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {question.className} · {question.courseCode}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[question.status]}`}
                  >
                    {STATUS_LABEL[question.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text)]">
                  {question.questionText}
                </p>
                {question.lecturerResponse ? (
                  <div className="mt-3 rounded-xl bg-[var(--color-hover)] p-3">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Response
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {question.lecturerResponse}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">
            You haven't asked a question yet.
          </p>
        )}
      </section>
    </div>
  );
}
