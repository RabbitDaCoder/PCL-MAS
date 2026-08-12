// Talks to the /classes/:classId/materials and /materials endpoints.
import { apiRequest } from "./apiClient";

export async function getClassMaterials(classId) {
  const body = await apiRequest(`/classes/${classId}/materials`, {
    auth: true,
  });
  return body.data;
}

export async function uploadMaterial(classId, { file, title, description }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (description) formData.append("description", description);

  const body = await apiRequest(`/classes/${classId}/materials`, {
    method: "POST",
    payload: formData,
    auth: true,
  });
  return body.data;
}

export async function deleteMaterial(materialId) {
  const body = await apiRequest(`/materials/${materialId}`, {
    method: "DELETE",
    auth: true,
  });
  return body.data;
}
