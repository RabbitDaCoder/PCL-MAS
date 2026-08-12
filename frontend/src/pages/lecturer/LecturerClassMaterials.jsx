// Materials — lecturer view: upload form + list with delete (owner lecturer only).
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderOpen, Upload, Trash2, FileText } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import {
  getClassMaterials,
  uploadMaterial,
  deleteMaterial,
} from "../../services/materialService";

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LecturerClassMaterials() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadMaterials() {
    return getClassMaterials(classId).then((data) => setMaterials(data));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getClassMaterials(classId)
      .then((data) => {
        if (isMounted) setMaterials(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load materials.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function validate() {
    const next = {};
    if (!title.trim()) next.title = "A title is required.";
    if (!file) next.file = "Choose a file to upload.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!validate()) return;
    setIsUploading(true);
    try {
      await uploadMaterial(classId, { file, title: title.trim(), description });
      showToast("Material uploaded.", "success");
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadMaterials();
    } catch (error) {
      showToast(error.message || "Couldn't upload that file.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMaterial(deleteTarget.id);
      showToast("Material deleted.", "success");
      setDeleteTarget(null);
      await loadMaterials();
    } catch (error) {
      showToast(error.message || "Couldn't delete that material.");
    } finally {
      setIsDeleting(false);
    }
  }

  const hasMaterials = materials.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(`/lecturer/classes/${classId}`)}
        className="flex w-fit items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to class
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Materials
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Upload files for your students to view or download.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <h2 className="text-sm font-medium text-[var(--color-text)]">
          Upload a material
        </h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-11 rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            placeholder="e.g. Week 1 slides"
          />
          {errors.title ? (
            <span className="text-xs text-[var(--color-error)]">
              {errors.title}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="rounded-[10px] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-[var(--color-text)]"
          />
          {errors.file ? (
            <span className="text-xs text-[var(--color-error)]">
              {errors.file}
            </span>
          ) : null}
        </div>
        <Button type="submit" isLoading={isUploading} className="w-fit">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasMaterials ? (
        <ul className="flex flex-col gap-3">
          {materials.map((material) => (
            <li
              key={material.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">
                    {material.title}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {material.uploadedByName}
                    {material.fileSize
                      ? ` · ${formatFileSize(material.fileSize)}`
                      : ""}
                    {material.extractionStatus === "pending"
                      ? " · Instructor AI is reading this…"
                      : material.extractionStatus === "failed"
                        ? " · Instructor AI couldn't read this file"
                        : ""}
                  </p>
                </div>
              </a>
              <button
                type="button"
                onClick={() => setDeleteTarget(material)}
                className="shrink-0 rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-error)]"
                aria-label={`Delete ${material.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center">
          <FolderOpen className="h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No materials uploaded yet.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this material?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
