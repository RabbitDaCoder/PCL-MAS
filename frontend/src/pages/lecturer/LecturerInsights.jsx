// Improvement insights — lecturer reviews AI-generated suggestions (evidence-backed, from
// accumulated feedback/review data), previews the effect of a candidate change, then applies
// (writes Class.aiInstructions) or dismisses. Nothing here is ever applied automatically.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getClassDetail } from "../../services/classService";
import {
  generateInsights,
  getInsights,
  dismissInsight,
  previewInsight,
  applyInsight,
} from "../../services/insightService";

const SEVERITY_CLASSES = {
  high: "border-red-500 text-red-500",
  medium: "border-amber-500 text-amber-500",
  low: "border-[var(--color-border)] text-[var(--color-text-secondary)]",
};

export default function LecturerInsights() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentInstructions, setCurrentInstructions] = useState("");
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [draftByInsight, setDraftByInsight] = useState({});
  const [samplePromptByInsight, setSamplePromptByInsight] = useState({});
  const [previewByInsight, setPreviewByInsight] = useState({});
  const [busyInsightId, setBusyInsightId] = useState(null);

  function loadInsights(instructions) {
    return getInsights(classId).then((data) => {
      setInsights(data.insights);
      setDraftByInsight((prev) => {
        const next = { ...prev };
        data.insights.forEach((insight) => {
          if (next[insight.id] === undefined) {
            const base = instructions ?? currentInstructions;
            next[insight.id] = [base, insight.suggestedInstructionText]
              .filter(Boolean)
              .join("\n\n");
          }
        });
        return next;
      });
    });
  }

  useEffect(() => {
    let isMounted = true;
    getClassDetail(classId)
      .then((detail) => {
        if (!isMounted) return;
        setCurrentInstructions(detail?.aiInstructions ?? "");
        return loadInsights(detail?.aiInstructions ?? "");
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load this class.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function handleGenerate() {
    setIsGenerating(true);
    setEmptyMessage("");
    try {
      const result = await generateInsights(classId);
      if (!result.generated) {
        setEmptyMessage(result.message || "No insights generated.");
      } else {
        showToast(`${result.count} new insight${result.count === 1 ? "" : "s"} generated.`, "success");
        await loadInsights();
      }
    } catch (error) {
      showToast(error.message || "Couldn't generate insights.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePreview(insightId) {
    setBusyInsightId(insightId);
    try {
      const result = await previewInsight(classId, {
        candidateInstructions: draftByInsight[insightId] ?? "",
        samplePrompt: samplePromptByInsight[insightId] || undefined,
      });
      setPreviewByInsight((prev) => ({ ...prev, [insightId]: result.turns }));
    } catch (error) {
      showToast(error.message || "Couldn't generate a preview.");
    } finally {
      setBusyInsightId(null);
    }
  }

  async function handleApply(insightId) {
    setBusyInsightId(insightId);
    try {
      await applyInsight(classId, insightId, draftByInsight[insightId] ?? "");
      showToast("Applied — this class's AI agents now follow the updated instructions.", "success");
      setInsights((prev) => prev.filter((insight) => insight.id !== insightId));
    } catch (error) {
      showToast(error.message || "Couldn't apply this insight.");
    } finally {
      setBusyInsightId(null);
    }
  }

  async function handleDismiss(insightId) {
    setBusyInsightId(insightId);
    try {
      await dismissInsight(classId, insightId);
      setInsights((prev) => prev.filter((insight) => insight.id !== insightId));
    } catch (error) {
      showToast(error.message || "Couldn't dismiss this insight.");
    } finally {
      setBusyInsightId(null);
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-[var(--color-accent)]" />
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Improvement Insights
          </h1>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Analyzing…" : "Generate insights"}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full max-w-2xl" />
      ) : (
        <div className="flex max-w-2xl flex-col gap-4">
          {emptyMessage ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{emptyMessage}</p>
          ) : null}

          {insights.length === 0 && !emptyMessage ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No pending insights. Generate insights once there's some student feedback or
              lecturer review notes to learn from.
            </p>
          ) : null}

          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-[var(--color-text)]">{insight.title}</p>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    SEVERITY_CLASSES[insight.severity] ?? SEVERITY_CLASSES.low
                  }`}
                >
                  {insight.severity}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">{insight.evidence}</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Instructions this class's AI agents will follow if you apply this
                </label>
                <textarea
                  value={draftByInsight[insight.id] ?? ""}
                  onChange={(event) =>
                    setDraftByInsight((prev) => ({
                      ...prev,
                      [insight.id]: event.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Preview question (optional — a default is used if left blank)
                </label>
                <input
                  value={samplePromptByInsight[insight.id] ?? ""}
                  onChange={(event) =>
                    setSamplePromptByInsight((prev) => ({
                      ...prev,
                      [insight.id]: event.target.value,
                    }))
                  }
                  placeholder="Can you help me understand the hardest topic in this class?"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {previewByInsight[insight.id] ? (
                <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-hover)] p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Sample reply with this change
                  </p>
                  {previewByInsight[insight.id].map((turn, index) => (
                    <div key={index} className="text-sm text-[var(--color-text)]">
                      <span className="font-medium">{turn.agent}: </span>
                      {turn.message}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="h-9 px-4 text-xs"
                  onClick={() => handlePreview(insight.id)}
                  disabled={busyInsightId === insight.id}
                >
                  Preview
                </Button>
                <Button
                  className="h-9 px-4 text-xs"
                  onClick={() => handleApply(insight.id)}
                  disabled={busyInsightId === insight.id}
                >
                  Apply
                </Button>
                <Button
                  variant="secondary"
                  className="h-9 px-4 text-xs"
                  onClick={() => handleDismiss(insight.id)}
                  disabled={busyInsightId === insight.id}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
