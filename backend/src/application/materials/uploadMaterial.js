// Use-case: lecturer uploads a material file for their class — stores the file in R2, then the
// metadata row that everything else (list/delete) reads from.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const {
  uploadMaterialFile,
} = require("../../infrastructure/storage/fileStorage");
const env = require("../../config/env");

const EXTRACTION_TIMEOUT_MS = 30000;

function toMaterialSummary(material) {
  const uploader = material.uploadedBy;
  return {
    id: material.id.toString(),
    classId: material.classId.toString(),
    title: material.title,
    description: material.description ?? "",
    fileUrl: material.fileUrl,
    fileType: material.fileType,
    fileSize: material.fileSize,
    extractionStatus: material.extractionStatus,
    uploadedByName: uploader
      ? `${uploader.firstName} ${uploader.lastName}`
      : null,
    createdAt: material.createdAt,
  };
}

// Fire-and-forget: the Instructor Agent extracts the PDF's text right away so later pre-test/
// learning-path generation can reuse it instead of re-downloading the same file. Never throws —
// a failed extraction just leaves the material at status "failed", generation falls back to
// downloading the URL directly like before.
async function extractMaterialText(materialRepository, material) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTRACTION_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${env.aiServiceBaseUrl}/api/extract-material`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ materialUrl: material.fileUrl }),
      },
    );
    if (!response.ok) throw new Error("extraction failed");
    const body = await response.json();
    await materialRepository.updateExtraction(material.id, {
      extractedText: body.extractedText ?? "",
      extractionStatus: "completed",
    });
  } catch {
    await materialRepository
      .updateExtraction(material.id, { extractionStatus: "failed" })
      .catch(() => {});
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadMaterial(
  { classRepository, materialRepository },
  { classId, lecturerId, title, description, file },
) {
  await assertLecturerOwnsClass(classRepository, classId, lecturerId);

  if (!file) throw new AppError("A file is required.", 400);
  if (!title) throw new AppError("A title is required.", 400);

  const { url } = await uploadMaterialFile({
    classId,
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
  });

  const isPdf = file.mimetype === "application/pdf";
  const material = await materialRepository.create({
    classId,
    uploadedBy: lecturerId,
    title,
    description,
    fileUrl: url,
    fileType: file.mimetype,
    fileSize: file.size,
    extractionStatus: isPdf ? "pending" : "skipped",
  });

  if (isPdf) {
    extractMaterialText(materialRepository, material);
  }

  return toMaterialSummary(material);
}

module.exports = uploadMaterial;
module.exports.toMaterialSummary = toMaterialSummary;
