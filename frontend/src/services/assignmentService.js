// Talks to the /classes/:classId/assignments and /assignments endpoints.
import { apiRequest } from "./apiClient";

export async function createAssignment(classId, fields) {
  const body = await apiRequest(`/classes/${classId}/assignments`, {
    method: "POST",
    payload: fields,
    auth: true,
  });
  return body.data;
}

export async function getClassAssignments(classId) {
  const body = await apiRequest(`/classes/${classId}/assignments`, {
    auth: true,
  });
  return body.data;
}

export async function getMyAssignments(classId) {
  const body = await apiRequest(`/classes/${classId}/assignments/mine`, {
    auth: true,
  });
  return body.data;
}

export async function submitAssignment(assignmentId, { text, file }) {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (file) formData.append("file", file);

  const body = await apiRequest(`/assignments/${assignmentId}/submit`, {
    method: "POST",
    payload: formData,
    auth: true,
  });
  return body.data;
}

export async function gradeAssignment(assignmentId, { score, feedback }) {
  const body = await apiRequest(`/assignments/${assignmentId}/grade`, {
    method: "POST",
    payload: { score, feedback },
    auth: true,
  });
  return body.data;
}
