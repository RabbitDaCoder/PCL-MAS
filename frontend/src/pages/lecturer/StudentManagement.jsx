// Student Management — list enrolled/invited students, invite by email, remove with confirmation.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import {
  getClassDetail,
  getClassStudents,
  inviteStudent,
  removeStudent,
} from "../../services/classService";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function StudentManagement() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [classDetail, setClassDetail] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const joinUrl = classDetail?.classCode
    ? `${window.location.origin}/student/classes?code=${classDetail.classCode}`
    : "";

  async function handleCopy(field, text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      showToast("Couldn't copy — try selecting the text manually.");
    }
  }

  function loadStudents() {
    return getClassStudents(classId)
      .then((data) => setStudents(data))
      .catch((error) => showToast(error.message || "Couldn't load students."));
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getClassStudents(classId)
      .then((data) => {
        if (isMounted) setStudents(data);
      })
      .catch((error) => {
        if (isMounted) showToast(error.message || "Couldn't load students.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    getClassDetail(classId)
      .then((data) => {
        if (isMounted) setClassDetail(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);
  async function handleInvite(event) {
    event.preventDefault();
    if (!email) {
      setEmailError("Email is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsInviting(true);
    try {
      const result = await inviteStudent(classId, email);
      showToast(
        result.status === "active"
          ? "Student added to the class."
          : "Invite sent — they'll be added once they register.",
        "success",
      );
      setEmail("");
      await loadStudents();
    } catch (error) {
      showToast(error.message || "Couldn't send the invite.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      await removeStudent(classId, removeTarget.studentId);
      showToast("Student removed.", "success");
      setRemoveTarget(null);
      await loadStudents();
    } catch (error) {
      showToast(error.message || "Couldn't remove the student.");
    } finally {
      setIsRemoving(false);
    }
  }

  const hasStudents = students.length > 0;

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
          Students
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Invite students by email and manage who's enrolled.
        </p>
      </div>

      {classDetail?.classCode ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div>
            <h2 className="text-sm font-medium text-[var(--color-text)]">
              Invite by code or link
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Share either with your students so they can join themselves.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Class code
              </span>
              <div className="flex items-center gap-2">
                <div className="flex min-h-11 flex-1 items-center rounded-[10px] border border-[var(--color-border)] px-4 font-mono text-lg tracking-[0.2em] text-[var(--color-text)]">
                  {classDetail.classCode}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("code", classDetail.classCode)}
                  aria-label="Copy class code"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
                >
                  {copiedField === "code" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Invite link
              </span>
              <div className="flex items-center gap-2">
                <div className="min-h-11 flex-1 truncate rounded-[10px] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)]">
                  {joinUrl}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("url", joinUrl)}
                  aria-label="Copy invite link"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
                >
                  {copiedField === "url" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleInvite}
        className="flex max-w-md flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <AuthInput
            label="Invite student"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="h-11 px-6 text-sm"
          disabled={isInviting}
        >
          {isInviting ? "Inviting…" : "Invite"}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : hasStudents ? (
        <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {student.firstName
                    ? `${student.firstName} ${student.lastName}`
                    : student.email}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {student.email}
                  {student.status === "pending" ? " · Invite pending" : null}
                  {student.joinedAt
                    ? ` · Joined ${new Date(student.joinedAt).toLocaleDateString()}`
                    : null}
                </p>
              </div>
              {student.studentId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3 text-xs"
                  onClick={() => setRemoveTarget(student)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-3 text-[var(--color-text)]">
            No students yet — invite one above.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove this student?"
        description={
          removeTarget
            ? `${removeTarget.firstName ? `${removeTarget.firstName} ${removeTarget.lastName}` : removeTarget.email} will lose access to this class.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
        isLoading={isRemoving}
      />
    </div>
  );
}
