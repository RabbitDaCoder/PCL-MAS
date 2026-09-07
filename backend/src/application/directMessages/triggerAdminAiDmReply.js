// Fire-and-forget: after a student sends a message in their 1:1 AI thread, routes it through the
// same mas-engine orchestrator used for class-group chat, then persists+emits the reply as one
// DirectMessage per agent turn. Any agent (Admin, Instructor, or Lecturer) may reply here — the
// student can call a specific one's attention with "@agent", same as in class-group chat. Never
// throws — a failed AI reply must never break the student's own message send, which has already
// been persisted and responded to.
const env = require("../../config/env");
const { toDmSummary } = require("./getDmThread");
const buildAgentContext = require("../classes/buildAgentContext");
const parseAgentMention = require("../shared/parseAgentMention");

const REQUEST_TIMEOUT_MS = 60000;

async function triggerAdminAiDmReply(
  {
    classRepository,
    assessmentRepository,
    directMessageRepository,
    userRepository,
    materialRepository,
  },
  { classId, studentId, content },
  { emitDmMessage, emitNotification },
) {
  try {
    const classDoc = await classRepository.findById(classId);
    const [student, pretest, agentContext] = await Promise.all([
      userRepository.findById(studentId),
      assessmentRepository.findOne(classId, studentId, "pre_test"),
      buildAgentContext(materialRepository, classId, classDoc),
    ]);
    const pretestStatus = pretest ? pretest.status : "not_started";
    const studentName = student
      ? `${student.firstName ?? "Student"}`.trim()
      : "Student";
    const mentionedAgent = parseAgentMention(content);

    const requestText =
      `A student named "${studentName}" sent this private message to their AI agents for their class "${classDoc?.name ?? "their class"}": ` +
      `"${content}"\n\n` +
      `The student's pre-test status is: ${pretestStatus}. ` +
      (pretestStatus !== "completed"
        ? `This is a private 1:1 channel, not the class group chat. Address the student by their first name, warmly greet them, and remind them to complete their pre-test before anything else — do not attempt to teach content yet.`
        : `They have already completed their pre-test, so respond naturally, using their first name.`) +
      ` This is the student's private 1:1 AI channel, not the class group chat — any of the ` +
      `Admin, Instructor, or Lecturer agents may reply here, exactly as they would in class-group chat.` +
      (mentionedAgent
        ? `\n\nThe student explicitly addressed the ${mentionedAgent} agent with "@${mentionedAgent}" ` +
          `— the ${mentionedAgent} agent MUST be the one who directly responds, unless the request ` +
          `is genuinely outside its scope, in which case briefly say so and route it correctly instead.`
        : "") +
      `\n\nClass topics: ${agentContext.topics.join(", ") || "none listed"}. ` +
      `Learning objectives: ${agentContext.learningObjectives.join(", ") || "none listed"}.` +
      (agentContext.materialsExcerpt
        ? `\n\nCourse material excerpts for this class (use these as the source of truth if ` +
          `the student asks about course content):\n${agentContext.materialsExcerpt}`
        : "") +
      (agentContext.aiInstructions
        ? `\n\nThe human lecturer's standing instructions for how their AI agents should behave ` +
          `in this class (follow these; they override your default judgment where they conflict):` +
          `\n${agentContext.aiInstructions}`
        : "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let turns;
    try {
      const response = await fetch(`${env.aiServiceBaseUrl}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ request: requestText }),
      });
      if (!response.ok) return;
      const body = await response.json();
      turns = body.turns;
    } finally {
      clearTimeout(timeout);
    }
    if (!Array.isArray(turns) || turns.length === 0) return;

    // Persist and emit one DM per agent turn, in order, so the thread shows each agent
    // speaking in its own voice instead of one blended reply.
    for (const turn of turns) {
      if (!turn?.message) continue;
      const message = await directMessageRepository.create({
        studentId,
        classId,
        senderType: "ai",
        aiAgent: turn.agent,
        content: turn.message,
      });
      const summary = toDmSummary(message);
      emitDmMessage(studentId, summary);
      emitNotification(studentId, {
        type: "ai-dm-message",
        classId,
        preview: turn.message.slice(0, 120),
        createdAt: message.createdAt,
      });
    }
  } catch {
    // Best-effort — errors here must never surface to the student.
  }
}

module.exports = triggerAdminAiDmReply;
