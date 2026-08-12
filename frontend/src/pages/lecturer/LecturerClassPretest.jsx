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

  function loadAssessment() {
    return getAssessment(classId, type).then((data) => setAssessment(data));
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
            No {label.toLowerCase()} has been generated for this class yet. The
            AI Instructor agent will build one from this class's topics,
            learning objectives and any uploaded PDF materials.
          </p>
          <Button
            className="mt-4 inline-flex items-center gap-2"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating
              ? "Generating… this can take a moment"
              : `Generate ${label.toLowerCase()}`}
          </Button>
        </div>
      ) : (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-text)]">
            <span className="font-medium">{assessment.completedCount}</span> of{" "}
            <span className="font-medium">{assessment.totalStudents}</span>{" "}
            students have completed the {label.toLowerCase()}.
          </p>
          {assessment.averageScore !== null ? (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Average score: {assessment.averageScore}%
            </p>
          ) : null}
          <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
            Questions ({assessment.questions.length})
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
            {assessment.questions.map((question, index) => (
              <li key={index}>{question.prompt}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
