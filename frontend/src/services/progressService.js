// Talks to the /classes/:classId/progress and /progress/me endpoints.
import { apiRequest } from "./apiClient";

export async function getClassProgress(classId) {
  const body = await apiRequest(`/classes/${classId}/progress`, {
    auth: true,
  });
  return body.data;
}

export async function getMyProgress(classId) {
  const body = await apiRequest(`/classes/${classId}/progress/me`, {
    auth: true,
  });
  return body.data;
}
