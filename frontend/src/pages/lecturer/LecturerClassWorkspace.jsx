// Class workspace — header + section hub: Students (built), Chat (deep-link), Questions
// (deep-link), Materials/Progress (placeholders, not built this task).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  MessageCircle,
  HelpCircle,
  FolderOpen,
  TrendingUp,
  ClipboardList,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getClassDetail } from "../../services/classService";

const SECTIONS = [
  {
    key: "students",
    label: "Students",
    icon: Users,
    description: "Manage who's enrolled and invite new students.",
    to: (classId) => `/lecturer/classes/${classId}/students`,
    available: true,
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessageCircle,
    description: "Message this class in real time.",
    to: (classId) => `/lecturer/chat?classId=${classId}`,
    available: true,
  },
  {
    key: "questions",
    label: "Questions",
    icon: HelpCircle,
    description: "Review questions from this class.",
    to: () => "/lecturer/questions",
    available: true,
  },
  {
    key: "materials",
    label: "Materials",
    icon: FolderOpen,
    description: "Upload files for your students.",
    to: (classId) => `/lecturer/classes/${classId}/materials`,
    available: true,
  },
  {
    key: "pretest",
    label: "Pre-Test",
    icon: ClipboardList,
    description: "AI-generated pre-test for this class.",
    to: (classId) => `/lecturer/classes/${classId}/assessments/pre-test`,
    available: true,
  },
  {
    key: "posttest",
    label: "Post-Test",
    icon: ClipboardCheck,
    description: "AI-generated post-test for this class.",
    to: (classId) => `/lecturer/classes/${classId}/assessments/post-test`,
    available: true,
  },
  {
    key: "progress",
    label: "Progress",
    icon: TrendingUp,
    description: "Engagement stats and AI learning insights.",
    to: (classId) => `/lecturer/classes/${classId}/progress`,
    available: true,
  },
  {
    key: "assignments",
    label: "Assignments",
    icon: ListChecks,
    description: "Create tasks and grade student submissions.",
    to: (classId) => `/lecturer/classes/${classId}/assignments`,
    available: true,
  },
];

export default function LecturerClassWorkspace() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [classDetail, setClassDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getClassDetail(classId)
      .then((data) => {
        if (isMounted) setClassDetail(data);
      })
      .catch((error) => {
        if (isMounted) {
          showToast(error.message || "Couldn't load this class.");
          navigate("/lecturer/classes");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast, navigate]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      {isLoading ? (
        <Skeleton className="h-16 w-full max-w-lg" />
      ) : (
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            {classDetail?.name}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {classDetail?.courseCode} · {classDetail?.studentCount ?? 0} student
            {classDetail?.studentCount === 1 ? "" : "s"}
          </p>
          {classDetail?.description ? (
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text)]">
              {classDetail.description}
            </p>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const content = (
            <>
              <Icon className="h-5 w-5 text-[var(--color-text-secondary)]" />
              <p className="mt-3 font-medium text-[var(--color-text)]">
                {section.label}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {section.description}
              </p>
            </>
          );

          if (!section.available) {
            return (
              <div
                key={section.key}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 opacity-50"
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => navigate(section.to(classId))}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition-colors hover:bg-[var(--color-hover)]"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
