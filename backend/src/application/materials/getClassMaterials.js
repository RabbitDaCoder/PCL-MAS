// Use-case: list materials for a class — owner lecturer or an active student member (who must
// have completed their pre-test — the Administrative AI gates everything else behind it).
const {
  assertClassAccess,
  assertPretestCompleted,
} = require("../classes/classAccess");
const { toMaterialSummary } = require("./uploadMaterial");

async function getClassMaterials(
  { classRepository, materialRepository, assessmentRepository },
  { classId, userId, role },
) {
  await assertClassAccess(classRepository, classId, userId, role);
  if (role === "student") {
    await assertPretestCompleted(assessmentRepository, classId, userId);
  }
  const materials = await materialRepository.findByClass(classId);
  return materials.map(toMaterialSummary);
}

module.exports = getClassMaterials;
