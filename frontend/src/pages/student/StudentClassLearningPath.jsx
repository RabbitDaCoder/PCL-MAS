// Learning Path — student view: AI-generated personalized study plan from the pre-test.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  generateLearningPath,
  getLearningPath,
} from "../../services/learningPathService";

const PRIORITY_STYLES = {
  high: "text-[var(--color-error)] border-[var(--color-error)]",
  medium: "text-[var(--color-accent)] border-[var(--color-accent)]",
  low: "text-[var(--color-text-secondary)] border-[var(--color-border)]",
};

export default function StudentClassLearningPath() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  function loadPath() {
    return getLearningPath(classId).then((data) => setPath(data));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getLearningPath(classId)
      .then((data) => {
        if (isMounted) setPath(data);
      })
      .catch((error) => {
        if (isMounted)
          showToast(error.message || "Couldn't load your learning path.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await generateLearningPath(classId);
      showToast("Learning path generated.");
      await loadPath();
    } catch (error) {
      showToast(error.message || "Couldn't generate your learning path.");
    } finally {
      setIsGenerating(false);
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
        <Compass className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Learning Path
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full max-w-lg" />
      ) : path?.pendingReview ? (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your learning path has been generated and is waiting for your
            lecturer to review it. Check back soon!
          </p>
        </div>
      ) : !path?.generated ? (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Complete your pre-test first, then generate a personalized learning
            path based on your results.
          </p>
          <Button
            className="mt-4 inline-flex items-center gap-2"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating
              ? "Generating… this can take a moment"
              : "Generate my learning path"}
          </Button>
        </div>
      ) : (
        <div className="flex max-w-lg flex-col gap-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-text)]">{path.summary}</p>
          </div>
          <div className="flex flex-col gap-3">
            {path.steps.map((step, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-text)]">
                    {step.topic}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                      PRIORITY_STYLES[step.priority] ?? PRIORITY_STYLES.low
                    }`}
                  >
                    {step.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {step.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
