// AI Settings — lecturer edits the private standing instructions their AI agents follow for
// this class. The only class field editable after creation, deliberately narrow in scope.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import TextareaField from "../../components/classes/TextareaField";
import { useToast } from "../../context/ToastContext";
import {
  getClassDetail,
  updateClassAiInstructions,
} from "../../services/classService";

export default function LecturerClassSettings() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [aiInstructions, setAiInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getClassDetail(classId)
      .then((data) => {
        if (isMounted) setAiInstructions(data?.aiInstructions ?? "");
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
  }, [classId, showToast]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateClassAiInstructions(classId, aiInstructions);
      showToast("AI instructions updated.", "success");
    } catch (error) {
      showToast(error.message || "Couldn't save these instructions.");
    } finally {
      setIsSaving(false);
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
        <Settings className="h-6 w-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          AI Settings
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full max-w-lg" />
      ) : (
        <div className="max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <TextareaField
            label="Instructions for your AI agents"
            helperText="Private — students never see this. Tone, grading leniency, what the agents should answer directly vs. defer to you on, anything they should avoid."
            placeholder="e.g. Be encouraging with beginners. If a question is about grading disputes or extensions, don't answer it yourself — tell the student you'll pass it to me."
            value={aiInstructions}
            onChange={(event) => setAiInstructions(event.target.value)}
            rows={6}
          />
          <div className="mt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
