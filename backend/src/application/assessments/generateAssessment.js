// Use-case: lecturer triggers pre-test/post-test generation for a class — calls the mas-engine
// Instructor Agent ONCE PER STUDENT (not once for the whole class) so each student gets their own
// distinct generated question set, using the same class topics/materials as input each time.
// Generation only runs once per class+type (no regeneration in V1).
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const env = require("../../config/env");

const TYPE_MAP = { "pre-test": "pre_test", "post-test": "post_test" };
const GENERATE_TIMEOUT_MS = 60000;

async function callInstructorAgent(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${env.aiServiceBaseUrl}/api/generate-assessment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      throw new AppError(
        "The AI service couldn't generate the test. Please try again shortly.",
        502,
      );
    }
    const responseBody = await response.json();
    return responseBody.questions;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "The AI service is unreachable. Please try again shortly.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

// One student's generation, with a single retry (mirrors mas-engine's own retry-once pattern for
// parse failures) — a transient failure for one student shouldn't need to fail the whole class.
async function generateQuestionsForStudent(requestBody) {
  try {
    return await callInstructorAgent(requestBody);
  } catch {
    return callInstructorAgent(requestBody);
  }
}

async function generateAssessment(
  { classRepository, materialRepository, assessmentRepository },
  { classId, lecturerId, type },
) {
  const dbType = TYPE_MAP[type];
  if (!dbType) throw new AppError("Invalid assessment type.", 400);

  const classDoc = await assertLecturerOwnsClass(
    classRepository,
    classId,
    lecturerId,
  );

  const alreadyExists = await assessmentRepository.existsForClassAndType(
    classId,
    dbType,
  );
  if (alreadyExists) {
    throw new AppError(
      `A ${type} has already been generated for this class.`,
      409,
    );
  }

  const members = await classRepository.findMembers(classId);
  const activeStudentIds = members
    .filter((member) => member.status === "active")
    .map((member) => member.studentId?._id ?? member.studentId);
  if (activeStudentIds.length === 0) {
    throw new AppError("This class has no active students yet.", 400);
  }

  const materials = await materialRepository.findByClass(classId);
  const pdfMaterials = materials.filter(
    (material) => material.fileType === "application/pdf",
  );
  // Prefer text already cached at upload time; only pass URLs for materials that aren't cached
  // yet, so mas-engine doesn't re-download files it already extracted.
  const materialsText = pdfMaterials
    .filter((material) => material.extractionStatus === "completed")
    .map((material) => material.extractedText)
    .filter(Boolean)
    .join("\n\n");
  const materialUrls = pdfMaterials
    .filter((material) => material.extractionStatus !== "completed")
    .map((material) => material.fileUrl);

  const requestBody = {
    assessmentType: type,
    topics: classDoc.topics ?? [],
    learningObjectives: classDoc.learningObjectives ?? [],
    materialUrls,
    materialsText,
    questionCount: 8,
  };

  // Accepted tradeoff (per product decision): one LLM call per student instead of one per class,
  // so each student's question set is genuinely their own, not a shared set replicated N times.
  let perStudentQuestions;
  try {
    perStudentQuestions = await Promise.all(
      activeStudentIds.map(() => generateQuestionsForStudent(requestBody)),
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "The AI service is unreachable. Please try again shortly.",
      502,
    );
  }

  const assessmentDocs = activeStudentIds.map((studentId, index) => ({
    classId,
    studentId,
    type: dbType,
    questions: perStudentQuestions[index].map((q) => ({
      topic: q.topic,
      prompt: q.question,
      options: q.options,
      correctAnswer: q.options[q.correctIndex],
    })),
    status: "pending",
  }));

  await assessmentRepository.createMany(assessmentDocs);

  return {
    generated: true,
    studentCount: activeStudentIds.length,
    questionCount: assessmentDocs[0]?.questions.length ?? 0,
  };
}

module.exports = generateAssessment;
