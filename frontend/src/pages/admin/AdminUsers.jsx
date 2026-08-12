// Paginated, searchable, filterable user list — read-only (no suspend/delete since that backend
// endpoint doesn't exist yet). New registrations appear at the top live via admin:user:new while
// this page is open.
import { useEffect, useState } from "react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import { getUsersList } from "../../services/adminService";

const PAGE_SIZE = 20;

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const handle = setTimeout(() => {
      getUsersList({ page, limit: PAGE_SIZE, search, role })
        .then((data) => {
          if (!isMounted) return;
          setUsers(data.users);
          setTotal(data.total);
        })
        .catch((error) => {
          if (isMounted) showToast(error.message || "Couldn't load users.");
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(handle);
    };
  }, [page, search, role, showToast]);

  useEffect(() => {
    const socket = getSocket("/admin");
    if (!socket) return undefined;

    const handleUserNew = (newUser) => {
      if (page !== 1) return;
      setUsers((prev) => [newUser, ...prev].slice(0, PAGE_SIZE));
      setTotal((prev) => prev + 1);
    };

    socket.on("admin:user:new", handleUserNew);
    return () => socket.off("admin:user:new", handleUserNew);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Users
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          All registered users, read-only.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search by name or email"
          className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] sm:max-w-xs"
        />
        <select
          value={role}
          onChange={(event) => {
            setPage(1);
            setRole(event.target.value);
          }}
          className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : users.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                    {user.email}
                  </td>
                  <td className="px-5 py-3 capitalize text-[var(--color-text-secondary)]">
                    {user.role}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        user.isActive
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.isActive
                            ? "bg-[var(--color-success)]"
                            : "bg-[var(--color-border)]"
                        }`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-[var(--color-text)]">
          No users match your filters.
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-[10px] border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <p>
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-[10px] border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
