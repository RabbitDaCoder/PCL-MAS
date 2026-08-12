// Fire-and-forget: after a student sends a class chat message, routes it through the mas-engine
// orchestrator Crew (which decides whether the Admin, Instructor, or Lecturer agent responds) and
// persists+emits the reply as an AI-authored message. Never throws — a failed AI reply must
// never break the student's own message send, which has already been persisted and responded to.
const env = require("../../config/env");
const { toMessageSummary } = require("./getClassMessages");

const REQUEST_TIMEOUT_MS = 60000;

async function triggerAdminAiReply(
  { classRepository, assessmentRepository, messageRepository, userRepository },
  { classId, studentId, content },
  { emitClassMessage },
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
      `A student named "${studentName}" sent this message in the class chat for "${classDoc?.name ?? "their class"}": ` +
      `"${content}"\n\n` +
      `The student's pre-test status is: ${pretestStatus}. ` +
      (pretestStatus !== "completed"
        ? `Address the student by their first name, warmly greet them, and say: "${studentName}, please complete your pre-test from the class workspace before anything else." Do not attempt to teach content yet.`
        : `Address the student by their first name and respond naturally as whichever agent best fits their message.`);

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

    const message = await messageRepository.create({
      classId,
      senderType: "ai",
      content: replyText,
      messageType: "ai_response",
    });
    emitClassMessage(classId, toMessageSummary(message));
  } catch {
    // Best-effort — errors here must never surface to the student.
  }
}

module.exports = triggerAdminAiReply;
