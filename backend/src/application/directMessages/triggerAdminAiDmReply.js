// Fire-and-forget: after a student sends a message in their 1:1 Administrative AI thread, routes
// it through the same mas-engine orchestrator used for class-group chat, then persists+emits the
// reply as a DirectMessage. Never throws — a failed AI reply must never break the student's own
// message send, which has already been persisted and responded to.
const env = require("../../config/env");
const { toDmSummary } = require("./getDmThread");

const REQUEST_TIMEOUT_MS = 60000;

async function triggerAdminAiDmReply(
  {
    classRepository,
    assessmentRepository,
    directMessageRepository,
    userRepository,
  },
  { classId, studentId, content },
  { emitDmMessage, emitNotification },
) {
  try {
    const classDoc = await classRepository.findById(classId);
    const [student, pretest] = await Promise.all([
      userRepository.findById(studentId),
      assessmentRepository.findOne(classId, studentId, "pre_test"),
    ]);
    const pretestStatus = pretest ? pretest.status : "not_started";
    const studentName = student
      ? `${student.firstName ?? "Student"}`.trim()
      : "Student";

    const requestText =
      `A student named "${studentName}" sent this private message to the Administrative AI for their class "${classDoc?.name ?? "their class"}": ` +
      `"${content}"\n\n` +
      `The student's pre-test status is: ${pretestStatus}. ` +
      (pretestStatus !== "completed"
        ? `This is a private 1:1 channel, not the class group chat. Address the student by their first name, warmly greet them, and remind them to complete their pre-test before anything else — do not attempt to teach content yet.`
        : `They have already completed their pre-test, so respond naturally, using their first name as the Administrative point of contact.`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let replyText;
    try {
      const response = await fetch(`${env.aiServiceBaseUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ request: requestText }),
      });
      if (!response.ok) return;
      const body = await response.json();
      replyText = body.response;
    } finally {
      clearTimeout(timeout);
    }
    if (!replyText) return;

    const message = await directMessageRepository.create({
      studentId,
      classId,
      sender: "administrative-ai",
      content: replyText,
    });
    const summary = toDmSummary(message);
    emitDmMessage(studentId, summary);
    emitNotification(studentId, {
      type: "ai-dm-message",
      classId,
      preview: replyText.slice(0, 120),
      createdAt: message.createdAt,
    });
  } catch {
    // Best-effort — errors here must never surface to the student.
  }
}

module.exports = triggerAdminAiDmReply;
