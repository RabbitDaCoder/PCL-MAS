// Talks to the /classes/:classId/insights endpoints.
import { apiRequest } from "./apiClient";

export async function generateInsights(classId) {
  const body = await apiRequest(`/classes/${classId}/insights/generate`, {
    method: "POST",
    auth: true,
  });
  return body.data;
}

export async function getInsights(classId, status = "pending") {
  const body = await apiRequest(
    `/classes/${classId}/insights?status=${status}`,
    { auth: true },
  );
  return body.data;
}

export async function dismissInsight(classId, insightId, reason) {
  const body = await apiRequest(
    `/classes/${classId}/insights/${insightId}/dismiss`,
    {
      method: "POST",
      payload: { reason },
      auth: true,
    },
  );
  return body.data;
}

export async function previewInsight(classId, { candidateInstructions, samplePrompt }) {
  const body = await apiRequest(`/classes/${classId}/insights/preview`, {
    method: "POST",
    payload: { candidateInstructions, samplePrompt },
    auth: true,
  });
  return body.data;
}

export async function applyInsight(classId, insightId, finalInstructionText) {
  const body = await apiRequest(
    `/classes/${classId}/insights/${insightId}/apply`,
    {
      method: "POST",
      payload: { finalInstructionText },
      auth: true,
    },
  );
  return body.data;
}
