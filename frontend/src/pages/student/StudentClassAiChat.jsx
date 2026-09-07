// Student "AI Chat" — a private 1:1 channel with the class's AI agents, a separate surface from
// the class-group Chat page. Any of Admin/Instructor/Lecturer may reply here, not just Admin —
// the student can call a specific one's attention with "@agent". History loads via REST, live
// updates arrive over the `classes` socket namespace's `dm:message:new` event (scoped to this
// classId). AI messages always carry a visible identity badge — never presented as an unlabeled
// system message or a human lecturer.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bot, Send, Sparkles } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import {
  getDmThread,
  sendDmMessage,
} from "../../services/directMessageService";
import { getAssessment } from "../../services/assessmentService";

function mergeUniqueMessages(previous, incoming) {
  const merged = new Map();
  [...previous, ...incoming].forEach((message) => {
    if (message && message.id) {
      merged.set(message.id, message);
    }
  });
  return [...merged.values()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
}

function formatMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function StudentClassAiChat() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pretestPending, setPretestPending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getDmThread(classId), getAssessment(classId, "pre-test")])
      .then(([thread, pretest]) => {
        if (!isMounted) return;
        setMessages(thread.messages);
        setPretestPending(!pretest.generated || pretest.status !== "completed");
      })
      .catch((error) =>
        showToast(error.message || "Couldn't load this conversation."),
      )
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [classId, showToast]);

  useEffect(() => {
    const socket = getSocket("/classes");
    if (!socket) return undefined;

    const refreshMessages = () => {
      getDmThread(classId)
        .then((thread) => setMessages(thread.messages))
        .catch(() => {});
    };

    function handleNewMessage(message) {
      if (message.classId !== classId) return;
      setMessages((prev) => mergeUniqueMessages(prev, [message]));
    }

    socket.on("connect", refreshMessages);
    socket.on("reconnect", refreshMessages);
    socket.on("dm:message:new", handleNewMessage);
    return () => {
      socket.off("connect", refreshMessages);
      socket.off("reconnect", refreshMessages);
      socket.off("dm:message:new", handleNewMessage);
    };
  }, [classId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      classId,
      senderType: "student",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => mergeUniqueMessages(prev, [optimisticMessage]));
    setDraft("");
    setIsSending(true);
    setIsTyping(true);
    try {
      const saved = await sendDmMessage(classId, content);
      setMessages((prev) =>
        mergeUniqueMessages(
          prev.filter((message) => message.id !== optimisticId),
          [saved],
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticId),
      );
      showToast(error.message || "Couldn't send that message.");
    } finally {
      setIsSending(false);
      window.setTimeout(() => setIsTyping(false), 1500);
    }
  }

  function handleDraftKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  }

  return (
    <div className="flex flex-1 flex-col sm:overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/student/classes/${classId}`)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                AI Chat
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Your private thread with this class's AI agents — use @admin, @instructor, or @lecturer to reach one directly
              </p>
            </div>
          </div>
        </div>
        {pretestPending ? (
          <Button
            className="!h-9 !px-4 !text-xs"
            onClick={() =>
              navigate(`/student/classes/${classId}/assessments/pre-test`)
            }
          >
            <Sparkles className="h-3.5 w-3.5" /> Take pre-test
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your Administrative AI greeting will appear here shortly.
          </p>
        ) : (
          <>
            {messages.map((message) => {
              const isAi = message.senderType === "ai";
              return (
                <div
                  key={message.id}
                  className={`flex max-w-[85%] flex-col gap-1 sm:max-w-md ${
                    isAi ? "self-start" : "self-end items-end"
                  }`}
                >
                  {isAi ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]">
                      <Bot className="h-3.5 w-3.5" /> {message.senderName}
                    </span>
                  ) : null}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      isAi
                        ? "bg-[var(--color-hover)] text-[var(--color-text)]"
                        : "bg-[var(--color-accent)] text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                  <span className="px-1 text-[10px] text-[var(--color-text-secondary)]">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              );
            })}
            {isTyping ? (
              <div className="self-start max-w-[85%] sm:max-w-md">
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]">
                  <Bot className="h-3.5 w-3.5" /> AI agent
                </span>
                <div className="mt-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
                  is typing...
                </div>
              </div>
            ) : null}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-[var(--color-border)] px-4 py-3 sm:px-6"
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          rows={1}
          placeholder="Message your AI agents… (try @admin, @instructor, or @lecturer)"
          className="min-h-11 max-h-32 flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
        <Button
          type="submit"
          className="!h-11 !w-11 !p-0"
          isLoading={isSending}
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
