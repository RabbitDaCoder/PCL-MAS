// Student home: "what am I learning, what do I need to do, how am I progressing?" — pulls the
// user from AuthContext (GET /auth/me) and classes from GET /api/v1/classes/mine.
import { useEffect, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getMyClasses } from "../../services/classService";

function getGreetingPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default function StudentDashboard() {
  const { user } = useAuth();
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
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Good {getGreetingPeriod()}, {user?.firstName}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Here's where your learning picks up.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Next up
        </h2>
        {isLoading ? (
          <Skeleton className="mt-3 h-6 w-2/3" />
        ) : hasClasses ? (
          <p className="mt-2 text-[var(--color-text)]">You're all caught up.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[var(--color-text)]">No classes yet.</p>
            <Button to="/student/classes" variant="primary" className="w-fit">
              Join a class
            </Button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Your classes
        </h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : hasClasses ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <p className="font-medium text-[var(--color-text)]">
                  {cls.name}
                </p>
                {cls.lecturerName ? (
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {cls.lecturerName}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                  {cls.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
            <p className="mt-3 text-[var(--color-text)]">
              You haven't joined a class yet.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Learning progress
        </h2>
        <p className="mt-2 text-[var(--color-text)]">
          Your progress will appear here once you start learning.
        </p>
      </section>

      <Button
        to="/student/chat"
        variant="secondary"
        className="flex w-full items-center justify-between gap-4 !rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 text-left"
      >
        <span className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[var(--color-text)]" />
          <span className="font-medium text-[var(--color-text)]">
            Ask a question
          </span>
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Coming soon
        </span>
      </Button>
    </div>
  );
}
