// Simple system panel — backend/DB connectivity + basic env info. MAS-engine reachability is
// deliberately NOT duplicated here; that lives on the dashboard's AI Service Status card.
import { useEffect, useState } from "react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getSystemInfo } from "../../services/adminService";

export default function AdminSystem() {
  const { showToast } = useToast();
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSystemInfo()
      .then((data) => {
        if (isMounted) setInfo(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load system info.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          System
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Backend and database connectivity.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Database connection
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  info?.dbConnected
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-error)]"
                }`}
              />
              <p className="text-sm text-[var(--color-text-secondary)]">
                {info?.dbConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Environment
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {info?.nodeEnv}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
