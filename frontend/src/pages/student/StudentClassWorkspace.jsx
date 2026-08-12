// Student class workspace — header + section hub: Chat (deep-link), Ask a question (deep-link).
// Every section except Chat and Pre-Test is locked until the student completes their pre-test —
// the Administrative AI walks them through this the moment they say hello in class chat.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MessageCircle,
  HelpCircle,
  FolderOpen,
  TrendingUp,
  ClipboardList,
  ClipboardCheck,
  Compass,
  ListChecks,
  Lock,
  Bot,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { getAssessment } from "../../services/assessmentService";
import { getClassDetail } from "../../services/classService";
import { getSocket } from "../../services/socket";

const SECTIONS = [
  {
    key: "chat",
    label: "Chat",
    icon: MessageCircle,
    description: "Message this class in real time.",
    to: (classId) => `/student/chat?classId=${classId}`,
    available: true,
    requiresPretest: false,
  },
  {
    key: "ai-chat",
    label: "AI Chat",
    icon: Bot,
    description: "Your private 1:1 conversation with the Administrative AI.",
    to: (classId) => `/student/classes/${classId}/ai-chat`,
    available: true,
    requiresPretest: false,
  },
  {
    key: "ask",
    label: "Ask a question",
    icon: HelpCircle,
    description: "Submit a question to your lecturer.",
    to: (classId) => `/student/ask?classId=${classId}`,
    available: true,
    requiresPretest: true,
  },
  {
    key: "materials",
    label: "Materials",
    icon: FolderOpen,
    description: "View files your lecturer has shared.",
    to: (classId) => `/student/classes/${classId}/materials`,
    available: true,
    requiresPretest: true,
  },
  {
    key: "pretest",
    label: "Pre-Test",
    icon: ClipboardList,
    description: "Take your pre-test for this class.",
    to: (classId) => `/student/classes/${classId}/assessments/pre-test`,
    available: true,
    requiresPretest: false,
  },
  {
    key: "posttest",
    label: "Post-Test",
    icon: ClipboardCheck,
    description: "Take your post-test for this class.",
    to: (classId) => `/student/classes/${classId}/assessments/post-test`,
    available: true,
    requiresPretest: true,
  },
  {
    key: "learning-path",
    label: "Learning Path",
    icon: Compass,
    description: "Your personalized study plan.",
    to: (classId) => `/student/classes/${classId}/learning-path`,
    available: true,
    requiresPretest: true,
  },
  {
    key: "progress",
    label: "Progress",
    icon: TrendingUp,
    description: "Your engagement stats and AI learning insights.",
    to: (classId) => `/student/classes/${classId}/progress`,
    available: true,
    requiresPretest: true,
  },
  {
    key: "assignments",
    label: "Assignments",
    icon: ListChecks,
    description: "View and submit your tasks.",
    to: (classId) => `/student/classes/${classId}/assignments`,
    available: true,
    requiresPretest: true,
  },
];

export default function StudentClassWorkspace() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [classDetail, setClassDetail] = useState(null);
  const [pretestCompleted, setPretestCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewAiMessage, setHasNewAiMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getClassDetail(classId), getAssessment(classId, "pre-test")])
      .then(([detail, pretest]) => {
        if (!isMounted) return;
        setClassDetail(detail);
        setPretestCompleted(
          Boolean(pretest.generated && pretest.status === "completed"),
        );
      })
      .catch((error) => {
        if (isMounted) {
          showToast(error.message || "Couldn't load this class.");
          navigate("/student/classes");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast, navigate]);

  useEffect(() => {
    const socket = getSocket("/classes");
    if (!socket) return undefined;

    function handleNotification(notification) {
      if (notification.classId !== classId) return;
      if (
        notification.type === "ai-dm-message" ||
        notification.type === "ai-onboarding-message"
      ) {
        setHasNewAiMessage(true);
      }
    }

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [classId]);

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
            {classDetail?.courseCode}
          </p>
          {classDetail?.description ? (
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text)]">
              {classDetail.description}
            </p>
          ) : null}
          {!pretestCompleted ? (
            <p className="mt-3 max-w-2xl rounded-xl bg-[var(--color-hover)] px-4 py-2 text-sm text-[var(--color-text)]">
              Say hello in Chat to meet the Administrative AI, then complete
              your pre-test to unlock the rest of this class.
            </p>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const locked = section.requiresPretest && !pretestCompleted;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                {locked ? (
                  <Lock className="h-4 w-4 text-[var(--color-text-secondary)]" />
                ) : null}
              </div>
              <p className="mt-3 flex items-center gap-1.5 font-medium text-[var(--color-text)]">
                {section.label}
                {section.key === "ai-chat" && hasNewAiMessage ? (
                  <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                ) : null}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {locked
                  ? "Locked until you complete your pre-test."
                  : section.description}
              </p>
            </>
          );

          if (!section.available || locked) {
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
              onClick={() => {
                if (section.key === "ai-chat") setHasNewAiMessage(false);
                navigate(section.to(classId));
              }}
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
