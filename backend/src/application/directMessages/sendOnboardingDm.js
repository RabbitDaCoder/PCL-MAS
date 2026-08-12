// Use-case: proactively greet a student the moment their ClassMembership goes active — enqueued
// (unawaited) by the controller right after responding to the join/accept request, so an LLM
// call never blocks that response. Backend-mediated context only: the agent gets a summarized
// {firstName, className, topics, learningObjectives, pretestStatus}, never raw user documents.
const env = require("../../config/env");
const { toDmSummary } = require("./getDmThread");

const REQUEST_TIMEOUT_MS = 60000;

async function sendOnboardingDm(
  {
    classRepository,
    userRepository,
    assessmentRepository,
    directMessageRepository,
  },
  { classId, studentId },
  { emitDmMessage, emitNotification },
) {
  try {
    // Idempotent: only greet a student once per class, not on every rejoin-after-removal cycle.
    const alreadyGreeted =
      await directMessageRepository.existsForStudentAndClass(
        studentId,
        classId,
      );
    if (alreadyGreeted) return;

    const [classDoc, student, pretest] = await Promise.all([
      classRepository.findById(classId),
      userRepository.findById(studentId),
      assessmentRepository.findOne(classId, studentId, "pre_test"),
    ]);
    if (!classDoc || !student) return;

    const pretestStatus = pretest ? pretest.status : "not_started";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let greeting;
    try {
      const response = await fetch(
        `${env.aiServiceBaseUrl}/api/generate-onboarding-message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            studentFirstName: student.firstName,
            className: classDoc.name,
            topics: classDoc.topics ?? [],
            learningObjectives: classDoc.learningObjectives ?? [],
            pretestStatus,
          }),
        },
      );
      if (!response.ok) return;
      const body = await response.json();
      greeting = body.message;
    } finally {
      clearTimeout(timeout);
    }
    if (!greeting) return;

    const message = await directMessageRepository.create({
      studentId,
      classId,
      sender: "administrative-ai",
      content: greeting,
    });
    const summary = toDmSummary(message);
    emitDmMessage(studentId, summary);
    emitNotification(studentId, {
      type: "ai-onboarding-message",
      classId,
      preview: greeting.slice(0, 120),
      createdAt: message.createdAt,
    });
  } catch {
    // Best-effort — a failed onboarding greeting must never break the join/accept flow.
  }
}

module.exports = sendOnboardingDm;
