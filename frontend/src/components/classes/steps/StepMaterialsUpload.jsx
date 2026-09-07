// Wizard step 5 — required initial materials upload right after the class is created, so the
// lecturer seeds the class with PDFs the AI agents use as their knowledge base for this class.
import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import Button from "../../ui/Button";
import { uploadMaterial } from "../../../services/materialService";

export default function StepMaterialsUpload({ classId, onUploaded }) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.pdf$/i, ""));
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose a PDF to upload.");
      return;
    }
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const material = await uploadMaterial(classId, {
        file,
        title: title.trim(),
      });
      setUploaded((prev) => [...prev, material]);
      onUploaded?.(material);
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError.message || "Couldn't upload that file.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Upload course PDFs (slides, notes, syllabus). Your AI agents use these
        to generate pre-tests and learning paths, and to answer questions and
        teach with your class's real content instead of generic filler.
        Upload at least one to finish setting up this class — you can add
        more anytime afterward.
      </p>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Week 1 slides"
            className="min-h-11 rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            PDF file
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="text-sm text-[var(--color-text)]"
          />
        </div>
        {error ? (
          <span className="text-xs text-[var(--color-error)]">{error}</span>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-fit px-6 text-sm"
          onClick={handleUpload}
          isLoading={isUploading}
        >
          <Upload className="h-4 w-4" /> Upload PDF
        </Button>
      </div>

      {uploaded.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {uploaded.map((material) => (
            <li
              key={material.id}
              className="flex items-center gap-3 rounded-[10px] border border-[var(--color-border)] px-4 py-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
              <span className="truncate text-sm text-[var(--color-text)]">
                {material.title}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
