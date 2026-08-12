// Use-case: a lecturer creates a new class they'll own — full setup-wizard payload (basic info,
// course details, and class settings), not just name/courseCode/description.
const AppError = require("../../domain/errors/AppError");

function toClassSummary(classDoc) {
  return {
    id: classDoc.id.toString(),
    name: classDoc.name,
    courseCode: classDoc.courseCode,
    description: classDoc.description ?? "",
    department: classDoc.department,
    level: classDoc.level,
    semester: classDoc.semester,
    academicSession: classDoc.academicSession,
    learningObjectives: classDoc.learningObjectives ?? [],
    topics: classDoc.topics ?? [],
    startDate: classDoc.startDate ?? null,
    endDate: classDoc.endDate ?? null,
    enrollmentMode: classDoc.enrollmentMode,
    classCode: classDoc.classCode,
    maxStudents: classDoc.maxStudents ?? null,
    studentCount: classDoc.studentCount,
    status: classDoc.status,
  };
}

async function createClass(
  { classRepository },
  {
    lecturerId,
    name,
    courseCode,
    department,
    level,
    semester,
    academicSession,
    description,
    learningObjectives,
    topics,
    startDate,
    endDate,
    enrollmentMode,
    classCode,
    maxStudents,
  },
) {
  if (!name) throw new AppError("Class name is required.", 400);
  if (!courseCode) throw new AppError("Course code is required.", 400);
  if (!department) throw new AppError("Department is required.", 400);
  if (!level) throw new AppError("Academic level is required.", 400);
  if (!semester) throw new AppError("Semester is required.", 400);
  if (!academicSession)
    throw new AppError("Academic session is required.", 400);

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    throw new AppError("End date can't be before the start date.", 400);
  }

  const classDoc = await classRepository.create({
    name,
    courseCode,
    department,
    level,
    semester,
    academicSession,
    description,
    learningObjectives: (learningObjectives ?? []).filter(Boolean),
    topics: (topics ?? []).filter(Boolean),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    enrollmentMode: enrollmentMode === "approval" ? "approval" : "code",
    classCode: classCode || undefined,
    maxStudents: maxStudents || undefined,
    lecturerId,
  });
  return toClassSummary(classDoc);
}

module.exports = createClass;
module.exports.toClassSummary = toClassSummary;
