// Use-case: lecturer previews the effect of a candidate AI-instructions change before applying
// it — a sandboxed dry-run reply. Nothing here is persisted to Message/AIInteraction/memory;
// mas-engine's /api/preview-reply calls the orchestrator directly with no side effects.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const buildAgentContext = require("../classes/buildAgentContext");
const env = require("../../config/env");

const REQUEST_TIMEOUT_MS = 60000;

async function previewInsight(
  { classRepository, materialRepository },
  { classId, lecturerId, candidateInstructions, samplePrompt },
) {
  const classDoc = await assertLecturerOwnsClass(classRepository, classId, lecturerId);
  const agentContext = await buildAgentContext(materialRepository, classId, classDoc);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/api/preview-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        candidateInstructions,
        ...(samplePrompt ? { samplePrompt } : {}),
        topics: agentContext.topics,
        learningObjectives: agentContext.learningObjectives,
        materialsExcerpt: agentContext.materialsExcerpt,
      }),
    });
    if (!response.ok) {
      throw new AppError(
        "The AI service couldn't generate a preview. Please try again shortly.",
        502,
      );
    }
    const body = await response.json();
    return { turns: body.turns };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("The AI service is unreachable. Please try again shortly.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = previewInsight;
