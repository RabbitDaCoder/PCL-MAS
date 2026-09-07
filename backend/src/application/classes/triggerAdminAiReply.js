// Fire-and-forget: after a student sends a class chat message, routes it through the mas-engine
// orchestrator Crew (which decides whether the Admin, Instructor, or Lecturer agent responds) and
// persists+emits the reply as an AI-authored message. Never throws — a failed AI reply must
// never break the student's own message send, which has already been persisted and responded to.
const env = require("../../config/env");
const { toMessageSummary } = require("./getClassMessages");
const buildAgentContext = require("./buildAgentContext");
const parseAgentMention = require("../shared/parseAgentMention");

const REQUEST_TIMEOUT_MS = 60000;

async function triggerAdminAiReply(
  {
    classRepository,
    assessmentRepository,
    messageRepository,
    userRepository,
    materialRepository,
  },
  { classId, studentId, content },
  { emitClassMessage },
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
      `A student named "${studentName}" sent this message in the class chat for "${classDoc?.name ?? "their class"}": ` +
      `"${content}"\n\n` +
      `The student's pre-test status is: ${pretestStatus}. ` +
      (pretestStatus !== "completed"
        ? `Address the student by their first name, warmly greet them, and say: "${studentName}, please complete your pre-test from the class workspace before anything else." Do not attempt to teach content yet.`
        : `Address the student by their first name and respond naturally as whichever agent best fits their message.`) +
      (mentionedAgent
        ? `\n\nThe student explicitly addressed the ${mentionedAgent} agent with "@${mentionedAgent}" ` +
          `— the ${mentionedAgent} agent MUST be the one who directly responds, unless the request ` +
          `is genuinely outside its scope, in which case briefly say so and route it correctly instead.`
        : "") +
      `\n\nClass topics: ${agentContext.topics.join(", ") || "none listed"}. ` +
      `Learning objectives: ${agentContext.learningObjectives.join(", ") || "none listed"}.` +
      (agentContext.materialsExcerpt
        ? `\n\nCourse material excerpts for this class (use these as the source of truth for ` +
          `teaching content and questions about the course):\n${agentContext.materialsExcerpt}`
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

    // Persist and emit one message per agent turn, in order, so the chat shows each agent
    // speaking in its own voice instead of one blended reply.
    for (const turn of turns) {
      if (!turn?.message) continue;
      const message = await messageRepository.create({
        classId,
        senderType: "ai",
        aiAgent: turn.agent,
        content: turn.message,
        messageType: "ai_response",
      });
      emitClassMessage(classId, toMessageSummary(message));
    }
  } catch {
    // Best-effort — errors here must never surface to the student.
  }
}

module.exports = triggerAdminAiReply;
