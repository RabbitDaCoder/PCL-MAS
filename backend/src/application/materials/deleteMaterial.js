// Use-case: lecturer deletes a material they own — removes both the R2 object and the DB row.
const AppError = require("../../domain/errors/AppError");
const { assertLecturerOwnsClass } = require("../classes/classAccess");
const {
  deleteMaterialFile,
  keyFromUrl,
} = require("../../infrastructure/storage/fileStorage");

async function deleteMaterial(
  { classRepository, materialRepository },
  { materialId, lecturerId },
) {
  const material = await materialRepository.findById(materialId);
  if (!material) throw new AppError("Material not found.", 404);

  await assertLecturerOwnsClass(
    classRepository,
    material.classId.toString(),
    lecturerId,
  );

  await deleteMaterialFile(keyFromUrl(material.fileUrl));
  await materialRepository.delete(materialId);

  return { id: materialId };
}

module.exports = deleteMaterial;
