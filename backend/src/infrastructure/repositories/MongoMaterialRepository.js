// Mongoose-backed implementation of the domain MaterialRepository contract.
const MaterialRepository = require("../../domain/repositories/MaterialRepository");
const MaterialModel = require("../database/models/Material");

class MongoMaterialRepository extends MaterialRepository {
  async create(materialData) {
    const material = await MaterialModel.create(materialData);
    return material.populate({
      path: "uploadedBy",
      select: "firstName lastName",
    });
  }

  async findByClass(classId) {
    return MaterialModel.find({ classId })
      .sort({ createdAt: -1 })
      .populate({ path: "uploadedBy", select: "firstName lastName" });
  }

  async findById(materialId) {
    return MaterialModel.findById(materialId);
  }

  async updateExtraction(materialId, { extractedText, extractionStatus }) {
    return MaterialModel.findByIdAndUpdate(materialId, {
      extractedText,
      extractionStatus,
    });
  }

  async delete(materialId) {
    return MaterialModel.findByIdAndDelete(materialId);
  }
}

module.exports = MongoMaterialRepository;
