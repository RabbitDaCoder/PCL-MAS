// Talks to GET /api/v1/classes/mine (see backend/src/interfaces/http/routes/classes.routes.js).
import { apiRequest } from "./apiClient";

export async function getMyClasses() {
  const body = await apiRequest("/classes/mine", { auth: true });
  return body.data;
}

export async function createClass(payload) {
  const body = await apiRequest("/classes", {
    method: "POST",
    payload,
    auth: true,
  });
  return body.data;
}

export async function generateClassCode() {
  const body = await apiRequest("/classes/generate-code", {
    method: "POST",
    auth: true,
  });
  return body.data;
}

export async function getClassDetail(classId) {
  const body = await apiRequest(`/classes/${classId}`, { auth: true });
  return body.data;
}

export async function getClassStudents(classId) {
  const body = await apiRequest(`/classes/${classId}/students`, {
    auth: true,
  });
  return body.data;
}

export async function inviteStudent(classId, email) {
  const body = await apiRequest(`/classes/${classId}/students/invite`, {
    method: "POST",
    payload: { email },
    auth: true,
  });
  return body.data;
}

export async function removeStudent(classId, userId) {
  await apiRequest(`/classes/${classId}/students/${userId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getClassMessages(classId, { page = 1, limit = 50 } = {}) {
  const body = await apiRequest(
    `/classes/${classId}/messages?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return body.data;
}

export async function sendClassMessage(classId, content) {
  const body = await apiRequest(`/classes/${classId}/messages`, {
    method: "POST",
    payload: { content },
    auth: true,
  });
  return body.data;
}

export async function clearClassMessages(classId) {
  await apiRequest(`/classes/${classId}/messages`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getClassInvites() {
  const body = await apiRequest("/classes/invites", { auth: true });
  return body.data;
}

export async function acceptClassInvite(classId) {
  const body = await apiRequest(`/classes/${classId}/invites/accept`, {
    method: "POST",
    auth: true,
  });
  return body.data;
}

export async function joinClass(classCode) {
  const body = await apiRequest("/classes/join", {
    method: "POST",
    payload: { classCode },
    auth: true,
  });
  return body.data;
}
