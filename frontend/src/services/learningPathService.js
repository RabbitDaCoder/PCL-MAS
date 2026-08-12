// Talks to the /classes/:classId/learning-path endpoints.
import { apiRequest } from "./apiClient";

export async function generateLearningPath(classId) {
  const body = await apiRequest(`/classes/${classId}/learning-path/generate`, {
    method: "POST",
    auth: true,
  });
  return body.data;
}

export async function getLearningPath(classId) {
  const body = await apiRequest(`/classes/${classId}/learning-path`, {
    auth: true,
  });
  return body.data;
}

export async function reviewLearningPath(classId, { studentId, decision }) {
  const body = await apiRequest(`/classes/${classId}/learning-path/review`, {
    method: "POST",
    auth: true,
    payload: { studentId, decision },
  });
  return body.data;
}
