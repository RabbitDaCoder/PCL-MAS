// Talks to the /classes/:classId/assessments/:type endpoints (pre-test/post-test).
import { apiRequest } from "./apiClient";

export async function generateAssessment(classId, type) {
  const body = await apiRequest(
    `/classes/${classId}/assessments/${type}/generate`,
    {
      method: "POST",
      auth: true,
    },
  );
  return body.data;
}

export async function getAssessment(classId, type) {
  const body = await apiRequest(`/classes/${classId}/assessments/${type}`, {
    auth: true,
  });
  return body.data;
}

export async function submitAssessment(classId, type, answers) {
  const body = await apiRequest(
    `/classes/${classId}/assessments/${type}/submit`,
    {
      method: "POST",
      payload: { answers },
      auth: true,
    },
  );
  return body.data;
}
