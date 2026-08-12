// Repository contract for class materials (file metadata).
class MaterialRepository {
  async create(_materialData) {
    throw new Error("Not implemented");
  }

  async findByClass(_classId) {
    throw new Error("Not implemented");
  }

  async findById(_materialId) {
    throw new Error("Not implemented");
  }

  async updateExtraction(_materialId, _fields) {
    throw new Error("Not implemented");
  }

  async delete(_materialId) {
    throw new Error("Not implemented");
  }
}

module.exports = MaterialRepository;
