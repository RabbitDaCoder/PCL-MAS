// Lecturer chat — one conversation per owned class. History loads via REST, then live updates
// arrive over the `classes` socket namespace's `class:message:new` event. Sending posts to REST
// (which persists + emits) with an optimistic bubble reconciled against the real message.
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getSocket } from "../../services/socket";
import {
  getMyClasses,
  getClassMessages,
  sendClassMessage,
  clearClassMessages,
} from "../../services/classService";

export default function LecturerChat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    getMyClasses()
      .then((data) => {
        if (!isMounted) return;
        setClasses(data);
        const preselect = searchParams.get("classId");
        if (preselect && data.some((cls) => cls.id === preselect)) {
          setSelectedClassId(preselect);
        } else if (data.length > 0) {
          setSelectedClassId(data[0].id);
        }
      })
      .catch((error) =>
        showToast(error.message || "Couldn't load your classes."),
      )
      .finally(() => {
        if (isMounted) setIsLoadingClasses(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedClassId) return undefined;
    let isMounted = true;
    setIsLoadingMessages(true);
    getClassMessages(selectedClassId)
      .then((data) => {
        if (isMounted) setMessages(data.messages);
      })
      .catch((error) => showToast(error.message || "Couldn't load messages."))
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedClassId, showToast]);

  useEffect(() => {
    const socket = getSocket("/classes");
    if (!socket) return undefined;

    function handleNewMessage(message) {
      if (message.classId !== selectedClassId) return;
      setMessages((prev) => {
        if (prev.some((existing) => existing.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    socket.on("class:message:new", handleNewMessage);
    return () => socket.off("class:message:new", handleNewMessage);
  }, [selectedClassId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedClassId) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      classId: selectedClassId,
      senderId: user?.id,
      senderName: `${user?.firstName} ${user?.lastName}`,
      senderRole: "lecturer",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    setIsSending(true);
    try {
      const saved = await sendClassMessage(selectedClassId, content);
      setMessages((prev) =>
        prev.map((message) => (message.id === optimisticId ? saved : message)),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticId),
      );
      showToast(error.message || "Couldn't send that message.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleClearChat() {
    if (!selectedClassId) return;
    const confirmed = window.confirm(
      "Clear this class chat and start fresh? This removes all existing messages.",
    );
    if (!confirmed) return;

    setIsClearingChat(true);
    try {
      await clearClassMessages(selectedClassId);
      setMessages([]);
    } catch (error) {
      showToast(error.message || "Couldn't clear this chat.");
    } finally {
      setIsClearingChat(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col sm:flex-row sm:overflow-hidden">
      <aside className="flex flex-col gap-1 border-b border-[var(--color-border)] px-4 py-4 sm:w-72 sm:border-b-0 sm:border-r sm:overflow-y-auto sm:px-4">
        <h1 className="px-2 pb-2 text-lg font-semibold text-[var(--color-text)]">
          Chat
        </h1>
        {isLoadingClasses ? (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => setSelectedClassId(cls.id)}
              className={`rounded-xl px-3 py-2 text-left transition-colors ${
                selectedClassId === cls.id
                  ? "bg-[var(--color-hover)]"
                  : "hover:bg-[var(--color-hover)]"
              }`}
            >
              <p className="text-sm font-medium text-[var(--color-text)]">
                {cls.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {cls.courseCode}
              </p>
            </button>
          ))
        ) : (
          <p className="px-2 text-sm text-[var(--color-text-secondary)]">
            Create a class to start chatting.
          </p>
        )}
      </aside>

      <section className="flex flex-1 flex-col">
        {selectedClass ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {selectedClass.name}
              </p>
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isClearingChat}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-secondary)] transition hover:bg-[var(--color-hover)] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isClearingChat ? "Clearing..." : "Clear chat"}
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {isLoadingMessages ? (
                <>
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="ml-auto h-10 w-2/3" />
                </>
              ) : messages.length > 0 ? (
                messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {!isOwn ? (
                        <p className="mb-1 px-1 text-xs text-[var(--color-text-secondary)]">
                          {message.senderName}
                        </p>
                      ) : null}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isOwn
                            ? "bg-[var(--color-accent)] text-white"
                            : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                  <MessageCircle className="h-8 w-8 text-[var(--color-text-secondary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No messages yet — say hello.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-[var(--color-border)] px-4 py-3"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message this class…"
                className="min-h-11 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)] outline-none focus-visible:border-[var(--color-text)]"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[var(--color-text-secondary)]">
            Select a class to start chatting.
          </div>
        )}
      </section>
    </div>
  );
}
