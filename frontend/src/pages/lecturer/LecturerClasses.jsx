// Lecturer's classes list — real data from GET /classes/mine, with a "Create class" entry point.
import { useEffect, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import InviteCodeBadge from "../../components/classes/InviteCodeBadge";
import { useToast } from "../../context/ToastContext";
import { getMyClasses } from "../../services/classService";

export default function LecturerClasses() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMyClasses()
      .then((data) => {
        if (isMounted) setClasses(data);
      })
      .catch((error) => {
        if (isMounted)
          showToast(error.message || "Couldn't load your classes.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const hasClasses = classes.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            My classes
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Everything you're teaching, in one place.
          </p>
        </div>
        {hasClasses ? (
          <Button
            to="/lecturer/classes/new"
            variant="primary"
            className="h-10 px-4 text-sm"
          >
            <Plus className="h-4 w-4" /> Create class
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : hasClasses ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {cls.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {cls.courseCode}
                </p>
                <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                  {cls.studentCount} student{cls.studentCount === 1 ? "" : "s"}
                </p>
                <div className="mt-3">
                  <InviteCodeBadge classCode={cls.classCode} />
                </div>
              </div>
              <Button
                to={`/lecturer/classes/${cls.id}`}
                variant="secondary"
                className="mt-4 h-9 px-4 text-xs"
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-3 text-[var(--color-text)]">
            You haven't created a class yet.
          </p>
          <Button
            to="/lecturer/classes/new"
            variant="primary"
            className="mt-4 w-fit mx-auto"
          >
            Create class
          </Button>
        </div>
      )}
    </div>
  );
}
