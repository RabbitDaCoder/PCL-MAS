// Builds the class context (topics, objectives, materials excerpt) appended to chat requests
// sent to the mas-engine orchestrator, so Admin/Instructor/Lecturer can answer from a class's
// real content instead of speaking in generic terms. Mirrors the materials-gathering pattern in
// generateAssessment.js, but capped much smaller since this runs on every chat turn, not once
// per class.
const MATERIALS_EXCERPT_MAX_CHARS = 3000;

async function buildAgentContext(materialRepository, classId, classDoc) {
  const materials = await materialRepository.findByClass(classId);
  const materialsExcerpt = materials
    .filter(
      (material) =>
        material.fileType === "application/pdf" &&
        material.extractionStatus === "completed",
    )
    .map((material) => material.extractedText)
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MATERIALS_EXCERPT_MAX_CHARS);

  return {
    topics: classDoc?.topics ?? [],
    learningObjectives: classDoc?.learningObjectives ?? [],
    materialsExcerpt,
    aiInstructions: classDoc?.aiInstructions ?? "",
  };
}

module.exports = buildAgentContext;
