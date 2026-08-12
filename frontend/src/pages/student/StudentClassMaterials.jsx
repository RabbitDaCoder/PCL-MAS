// Materials — student view: read-only list, opens each item in a new tab.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderOpen, FileText } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getClassMaterials } from "../../services/materialService";

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentClassMaterials() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getClassMaterials(classId)
      .then((data) => {
        if (isMounted) setMaterials(data);
      })
      .catch((error) => {
        if (isMounted) {
          showToast(error.message || "Couldn't load materials.");
          navigate(`/student/classes/${classId}`);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const hasMaterials = materials.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(`/student/classes/${classId}`)}
        className="flex w-fit items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to class
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Materials
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Files your lecturer has shared with this class.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasMaterials ? (
        <ul className="flex flex-col gap-3">
          {materials.map((material) => (
            <li key={material.id}>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:bg-[var(--color-hover)]"
              >
                <FileText className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">
                    {material.title}
                  </p>
                  {material.description ? (
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {material.description}
                    </p>
                  ) : null}
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {material.uploadedByName}
                    {material.fileSize
                      ? ` · ${formatFileSize(material.fileSize)}`
                      : ""}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center">
          <FolderOpen className="h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No materials have been uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
}
