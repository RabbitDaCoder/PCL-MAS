// Lecturer home: what needs attention, what classes are running, how students are doing — pulls
// the user from AuthContext (GET /auth/me), classes from GET /api/v1/classes/mine, and
// pending/activity/stats from REST on first paint, kept live over the `/classes` namespace's
// personal lecturer room after that.
import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import LiveIndicator from "../../components/admin/LiveIndicator";
import InviteCodeBadge from "../../components/classes/InviteCodeBadge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import { getMyClasses } from "../../services/classService";
import {
  getLecturerDashboardStats,
  getLecturerPendingActions,
  getLecturerActivity,
} from "../../services/lecturerService";

function getGreetingPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default function LecturerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ classCount: 0, studentCount: 0 });
  const [pendingActions, setPendingActions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const hasDisconnectedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getMyClasses(),
      getLecturerDashboardStats(),
      getLecturerPendingActions(),
      getLecturerActivity(),
    ])
      .then(([classesData, statsData, pendingData, activityData]) => {
        if (!isMounted) return;
        setClasses(classesData);
        setStats(statsData);
        setPendingActions(pendingData);
        setActivity(activityData);
      })
      .catch((error) => {
        if (isMounted)
          showToast(error.message || "Couldn't load your dashboard.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    const socket = getSocket("/classes");
    if (!socket) return undefined;

    const handleConnect = () => {
      setIsSocketConnected(true);
      if (hasDisconnectedRef.current) {
        showToast("Live connection restored.", "success");
      }
    };
    const handleDisconnect = () => {
      setIsSocketConnected(false);
      hasDisconnectedRef.current = true;
      showToast("Live updates paused — reconnecting…");
    };
    const handleStatsUpdate = (nextStats) => setStats(nextStats);
    const handlePendingUpdate = (nextPending) => setPendingActions(nextPending);
    const handleActivityUpdate = (nextActivity) => setActivity(nextActivity);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("lecturer:stats:update", handleStatsUpdate);
    socket.on("lecturer:pending:update", handlePendingUpdate);
    socket.on("lecturer:activity:update", handleActivityUpdate);
    setIsSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("lecturer:stats:update", handleStatsUpdate);
      socket.off("lecturer:pending:update", handlePendingUpdate);
      socket.off("lecturer:activity:update", handleActivityUpdate);
    };
  }, [showToast]);

  const hasClasses = classes.length > 0;
  const hasPendingActions = pendingActions.length > 0;
  const hasActivity = activity.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Good {getGreetingPeriod()}, {user?.firstName}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Here's what's happening across your classes.
          </p>
        </div>
        <LiveIndicator connected={isSocketConnected} />
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Pending actions
        </h2>
        {isLoading ? (
          <Skeleton className="mt-3 h-5 w-48" />
        ) : hasPendingActions ? (
          <div className="mt-3 divide-y divide-[var(--color-border)]">
            {pendingActions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <p className="text-sm text-[var(--color-text)]">{item.label}</p>
                <Button
                  to={item.actionHref}
                  variant="secondary"
                  className="h-8 px-3 text-xs"
                >
                  {item.actionLabel}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[var(--color-text)]">
            Nothing needs your attention right now.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
            Your classes
            <span className="ml-2 font-normal text-[var(--color-text-secondary)]">
              ({stats.classCount} class{stats.classCount === 1 ? "" : "es"},{" "}
              {stats.studentCount} student{stats.studentCount === 1 ? "" : "s"})
            </span>
          </h2>
          {hasClasses ? (
            <Button
              to="/lecturer/classes"
              variant="secondary"
              className="h-9 px-4 text-xs"
            >
              Create class
            </Button>
          ) : null}
        </div>
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
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {cls.courseCode}
                </p>
                {cls.studentCount > 0 ? (
                  <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                    {cls.studentCount} student
                    {cls.studentCount === 1 ? "" : "s"}
                  </p>
                ) : null}
                <div className="mt-3">
                  <InviteCodeBadge classCode={cls.classCode} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
            <p className="mt-3 text-[var(--color-text)]">
              You haven't created a class yet.
            </p>
            <Button
              to="/lecturer/classes"
              variant="primary"
              className="mt-4 w-fit mx-auto"
            >
              Create class
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Student activity
        </h2>
        {isLoading ? (
          <Skeleton className="mt-3 h-5 w-40" />
        ) : hasActivity ? (
          <div className="mt-3 divide-y divide-[var(--color-border)]">
            {activity.map((item) => (
              <div key={item.id} className="py-2">
                <p className="text-sm text-[var(--color-text)]">
                  {item.studentName} — {item.description}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {item.className} · {item.when}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[var(--color-text)]">
            No recent activity yet.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Assessments overview
        </h2>
        <p className="mt-2 text-[var(--color-text)]">No assessments yet.</p>
      </section>
    </div>
  );
}
