// Admin classes overview — a real empty state, not a fake list. Wired to GET /admin/classes,
// which returns an honest {data: []} until class creation ships.
// TODO: replace once class creation ships
import { useEffect, useState } from "react";
import Skeleton from "../../components/ui/Skeleton";
import InviteCodeBadge from "../../components/classes/InviteCodeBadge";
import { useToast } from "../../context/ToastContext";
import { getClassesOverview } from "../../services/adminService";

export default function AdminClasses() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getClassesOverview()
      .then((data) => {
        if (isMounted) setClasses(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load classes.");
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
          Classes
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          All classes across the platform.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : classes.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Lecturer</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Invite</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr
                  key={classItem.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">
                    {classItem.name}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                    {classItem.lecturerName ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                    {classItem.studentCount}
                  </td>
                  <td className="px-5 py-3 capitalize text-[var(--color-text-secondary)]">
                    {classItem.status}
                  </td>
                  <td className="px-5 py-3">
                    <InviteCodeBadge classCode={classItem.classCode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-[var(--color-text)]">
          No classes have been created yet.
        </div>
      )}
    </div>
  );
}
