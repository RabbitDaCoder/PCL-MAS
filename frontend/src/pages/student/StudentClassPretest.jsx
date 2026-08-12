// Pre-test/post-test — student view: take the test (radio per question) or see the result if
// already submitted. Fetching auto-starts the attempt server-side (status flips pending → in_progress).
// `type` route param ("pre-test"|"post-test") selects which assessment this renders.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  getAssessment,
  submitAssessment,
} from "../../services/assessmentService";

const TYPE_LABELS = { "pre-test": "Pre-Test", "post-test": "Post-Test" };

export default function StudentClassPretest() {
  const { classId, type } = useParams();
  const label = TYPE_LABELS[type] ?? "Assessment";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAssessment(classId, type)
      .then((data) => {
        if (!isMounted) return;
        setAssessment(data);
        if (data.generated) {
          setAnswers(new Array(data.questions.length).fill(""));
          if (data.status === "completed") {
            setResult({ score: data.score });
          }
        }
      })
      .catch((error) => {
        if (isMounted)
          showToast(
            error.message || `Couldn't load the ${label.toLowerCase()}.`,
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, type]);

  function handleSelect(questionIndex, option) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = option;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (answers.some((answer) => !answer)) {
      showToast("Please answer every question before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await submitAssessment(classId, type, answers);
      setResult(data);
      showToast(`${label} submitted.`);
    } catch (error) {
      showToast(error.message || `Couldn't submit the ${label.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <ClipboardList className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {label}
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full max-w-lg" />
      ) : !assessment?.generated ? (
        <p className="max-w-lg text-sm text-[var(--color-text-secondary)]">
          {assessment?.message ||
            `Your lecturer AI is generating this ${label.toLowerCase()} and will send it to your lecturer for approval automatically. Check back soon.`}
        </p>
      ) : result ? (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-lg font-semibold text-[var(--color-text)]">
            You scored {result.score}%
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {type === "pre-test"
              ? "Your lecturer can see your result. This helps tailor your learning path."
              : "Your lecturer can see your result. Great work finishing the class!"}
          </p>
          {type === "pre-test" ? (
            <Button
              className="mt-4"
              onClick={() =>
                navigate(`/student/classes/${classId}/learning-path`)
              }
            >
              View my learning path
            </Button>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
          {assessment.questions.map((question, questionIndex) => (
            <fieldset
              key={questionIndex}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <legend className="text-sm font-medium text-[var(--color-text)]">
                {questionIndex + 1}. {question.prompt}
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm text-[var(--color-text)]"
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option}
                      checked={answers[questionIndex] === option}
                      onChange={() => handleSelect(questionIndex, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit pre-test"}
          </Button>
        </form>
      )}
    </div>
  );
}
