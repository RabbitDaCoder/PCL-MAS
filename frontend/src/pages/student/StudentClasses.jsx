// Student's classes list — active memberships from GET /classes/mine, pending invites from
// GET /classes/invites (accept inline), plus a self-serve "join by code" form.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";
import Button from "../../components/ui/Button";
import AuthInput from "../../components/auth/AuthInput";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  getMyClasses,
  getClassInvites,
  acceptClassInvite,
  joinClass,
} from "../../services/classService";

export default function StudentClasses() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [classCode, setClassCode] = useState(
    () => searchParams.get("code")?.toUpperCase() || "",
  );
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  function loadAll() {
    return Promise.all([getMyClasses(), getClassInvites()]);
  }

  useEffect(() => {
    let isMounted = true;
    loadAll()
      .then(([classesData, invitesData]) => {
        if (!isMounted) return;
        setClasses(classesData);
        setInvites(invitesData);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccept(classId) {
    setAcceptingId(classId);
    try {
      await acceptClassInvite(classId);
      const [classesData, invitesData] = await loadAll();
      setClasses(classesData);
      setInvites(invitesData);
      showToast("You're in — class added.", "success");
    } catch (error) {
      showToast(error.message || "Couldn't accept that invite.");
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    const code = classCode.trim();
    if (!code) {
      setJoinError("Enter a class code.");
      return;
    }
    setJoinError("");
    setIsJoining(true);
    try {
      await joinClass(code);
      const [classesData, invitesData] = await loadAll();
      setClasses(classesData);
      setInvites(invitesData);
      setClassCode("");
      showToast("Joined class.", "success");
    } catch (error) {
      showToast(error.message || "Couldn't join that class.");
    } finally {
      setIsJoining(false);
    }
  }

  const hasClasses = classes.length > 0;
  const hasInvites = invites.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          My classes
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Everything you're enrolled in, in one place.
        </p>
      </div>

      <form
        onSubmit={handleJoin}
        className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <AuthInput
            label="Join a class by code"
            placeholder="e.g. AB12CD"
            value={classCode}
            onChange={(event) => setClassCode(event.target.value.toUpperCase())}
            error={joinError}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="h-11 px-6 text-sm"
          disabled={isJoining}
        >
          {isJoining ? "Joining…" : "Join"}
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : hasInvites ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
            Pending invites
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {invites.map((invite) => (
              <div
                key={invite.classId}
                className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div>
                  <Mail className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  <p className="mt-2 font-medium text-[var(--color-text)]">
                    {invite.className}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {invite.courseCode}
                    {invite.lecturerName ? ` · ${invite.lecturerName}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  className="mt-4 h-9 px-4 text-xs"
                  disabled={acceptingId === invite.classId}
                  onClick={() => handleAccept(invite.classId)}
                >
                  {acceptingId === invite.classId ? "Accepting…" : "Accept"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Enrolled classes
        </h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  {cls.lecturerName ? (
                    <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                      {cls.lecturerName}
                    </p>
                  ) : null}
                </div>
                <Button
                  to={`/student/classes/${cls.id}`}
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
              You haven't joined a class yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
