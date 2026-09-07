// Pre-test/post-test — lecturer view: generate action if not yet created, else completion stats
// + preview. `type` route param ("pre-test"|"post-test") selects which assessment this renders.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  generateAssessment,
  getAssessment,
  reviewAssessment,
} from "../../services/assessmentService";

const TYPE_LABELS = { "pre-test": "Pre-Test", "post-test": "Post-Test" };

export default function LecturerClassPretest() {
  const { classId, type } = useParams();
  const label = TYPE_LABELS[type] ?? "Assessment";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);

  function loadAssessment() {
    return getAssessment(classId, type).then((data) => {
      setAssessment(data);
      if (data?.generated) {
        setDraftQuestions(
          data.questions.map((question, index) => {
            const options = Array.isArray(question.options)
              ? [...question.options]
              : [];
            const correctAnswer = question.correctAnswer ?? options[0] ?? "";
            return {
              id: `${index}-${question.prompt}`,
              topic: question.topic ?? "",
              prompt: question.prompt ?? "",
              options,
              correctAnswer,
            };
          }),
        );
      }
    });
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getAssessment(classId, type)
      .then((data) => {
        if (isMounted) setAssessment(data);
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

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await generateAssessment(classId, type);
      showToast(`${label} generated.`);
      await loadAssessment();
    } catch (error) {
      showToast(
        error.message || `Couldn't generate the ${label.toLowerCase()}.`,
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function updateQuestion(index, field, value) {
    setDraftQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question,
      ),
    );
  }

  function updateOption(index, optionIndex, value) {
    setDraftQuestions((prev) =>
      prev.map((question, questionIndex) => {
        if (questionIndex !== index) return question;
        const nextOptions = [...question.options];
        nextOptions[optionIndex] = value;
        return { ...question, options: nextOptions };
      }),
    );
  }

  async function handleReview(decision) {
    if (!assessment?.generated) return;
    setIsReviewing(true);
    try {
      await reviewAssessment(
        classId,
        type,
        decision,
        draftQuestions.map((question) => ({
          topic: question.topic,
          prompt: question.prompt,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      );
      showToast(
        decision === "approve"
          ? `${label} approved and released to students.`
          : `${label} rejected and sent back for regeneration.`,
      );
      await loadAssessment();
    } catch (error) {
      showToast(error.message || `Couldn't review the ${label.toLowerCase()}.`);
    } finally {
      setIsReviewing(false);
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
        <ClipboardList className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {label}
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full max-w-lg" />
      ) : !assessment?.generated ? (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {assessment?.message ||
              `Your lecturer AI is generating this ${label.toLowerCase()} for review automatically. It will appear here shortly.`}
          </p>
        </div>
      ) : (
        <div className="max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-[var(--color-text)]">
              <span className="font-medium">{assessment.completedCount}</span> of{" "}
              <span className="font-medium">{assessment.totalStudents}</span>{" "}
              students have completed the {label.toLowerCase()}.
            </p>
            <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-hover)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              {assessment.reviewStatus ?? "pending"}
            </span>
          </div>
          {assessment.averageScore !== null ? (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Average score: {assessment.averageScore}%
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            {draftQuestions.map((question, index) => (
              <div
                key={question.id || index}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Question {index + 1}
                </label>
                <input
                  value={question.topic}
                  onChange={(event) =>
                    updateQuestion(index, "topic", event.target.value)
                  }
                  className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  placeholder="Topic"
                />
                <textarea
                  value={question.prompt}
                  onChange={(event) =>
                    updateQuestion(index, "prompt", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  placeholder="Question prompt"
                />
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={`${question.id}-option-${optionIndex}`}
                      className={`flex gap-2 rounded-lg border p-2 transition-colors ${
                        question.correctAnswer === option
                          ? "border-green-500 bg-green-500/10"
                          : "border-[var(--color-border)] bg-transparent"
                      }`}
                    >
                      <input
                        value={option}
                        onChange={(event) =>
                          updateOption(index, optionIndex, event.target.value)
                        }
                        className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(index, "correctAnswer", option)
                        }
                        className={`shrink-0 rounded-lg border px-2.5 py-2 text-[10px] font-medium uppercase tracking-wide ${
                          question.correctAnswer === option
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        }`}
                        title={
                          question.correctAnswer === option
                            ? "This is the current correct answer"
                            : "Set as the correct answer"
                        }
                      >
                        {question.correctAnswer === option ? "Answer key" : "Set"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => handleReview("approve")}
              disabled={isReviewing}
              className="inline-flex items-center gap-2"
            >
              {isReviewing ? "Reviewing…" : "Approve & release"}
            </Button>
            <Button
              onClick={() => handleReview("reject")}
              variant="secondary"
              disabled={isReviewing}
            >
              Reject & regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
