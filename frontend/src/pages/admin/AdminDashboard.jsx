// Admin overview: real system counts, per-agent AI service status, and recently registered
// users. Initial load via REST (getAdminStats/getAiStatus/getRecentUsers), then kept live via
// the `/admin` Socket.io namespace — REST never gets ripped out, sockets just keep it fresh.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../../components/ui/Skeleton";
import LiveIndicator from "../../components/admin/LiveIndicator";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import {
  getAdminStats,
  getAiStatus,
  getRecentUsers,
} from "../../services/adminService";

const AGENT_LABELS = {
  administrative: "Administrative",
  instructor: "Instructor",
  lecturer: "Lecturer",
};

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AgentStatusRow({ agentKey, agent, unreachable }) {
  const state = unreachable
    ? "unreachable"
    : agent?.configured
      ? "connected"
      : "not-configured";

  const dotColor = {
    connected: "bg-[var(--color-success)]",
    unreachable: "bg-[var(--color-error)]",
    "not-configured": "bg-[var(--color-warning)]",
  }[state];

  const label = {
    connected: agent?.model ? `Connected — ${agent.model}` : "Connected",
    unreachable: "Unreachable",
    "not-configured": "Not configured",
  }[state];

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <p className="text-sm font-medium text-[var(--color-text)]">
        {AGENT_LABELS[agentKey]}
      </p>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const hasDisconnectedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getAdminStats(), getAiStatus(), getRecentUsers()])
      .then(([statsData, aiData, usersData]) => {
        if (!isMounted) return;
        setStats(statsData);
        setAiStatus(aiData);
        setRecentUsers(usersData);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load admin data.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    const socket = getSocket("/admin");
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
    const handleAiStatusUpdate = (nextAiStatus) => setAiStatus(nextAiStatus);
    const handleUserNew = (newUser) =>
      setRecentUsers((prev) => [newUser, ...prev].slice(0, 5));

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("admin:stats:update", handleStatsUpdate);
    socket.on("admin:ai-status:update", handleAiStatusUpdate);
    socket.on("admin:user:new", handleUserNew);
    setIsSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("admin:stats:update", handleStatsUpdate);
      socket.off("admin:ai-status:update", handleAiStatusUpdate);
      socket.off("admin:user:new", handleUserNew);
    };
  }, []);

  const statCards = stats
    ? [
        { label: "Total users", value: stats.totalUsers },
        { label: "Students", value: stats.totalStudents },
        { label: "Lecturers", value: stats.totalLecturers },
        { label: "Classes", value: stats.totalClasses },
      ]
    : [];

  const agentEntries = Object.entries(aiStatus?.agents ?? {});
  const isUnreachable = aiStatus?.status === "unreachable";

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            System overview
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Live counts from the database.
          </p>
        </div>
        <LiveIndicator connected={isSocketConnected} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? ["total", "students", "lecturers", "classes"].map((key) => (
              <Skeleton key={key} className="h-24" />
            ))
          : statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <p className="text-2xl font-semibold text-[var(--color-text)]">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {card.label}
                </p>
              </div>
            ))}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          AI service status
        </h2>
        {isLoading ? (
          <Skeleton className="mt-3 h-20 w-full" />
        ) : (
          <div className="mt-2 divide-y divide-[var(--color-border)]">
            {agentEntries.map(([agentKey, agent]) => (
              <AgentStatusRow
                key={agentKey}
                agentKey={agentKey}
                agent={agent}
                unreachable={isUnreachable}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
            Recent users
          </h2>
          <Link
            to="/admin/users"
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : recentUsers.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {recentUsers.map((recentUser) => (
              <div
                key={recentUser.id}
                className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-3 last:border-b-0"
              >
                <p className="font-medium text-[var(--color-text)]">
                  {recentUser.firstName} {recentUser.lastName}
                </p>
                <p className="text-sm capitalize text-[var(--color-text-secondary)]">
                  {recentUser.role}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {formatDate(recentUser.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-[var(--color-text)]">
            No users yet.
          </div>
        )}
      </section>
    </div>
  );
}
