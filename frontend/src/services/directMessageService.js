// Talks to the /classes/:classId/dm endpoints — the 1:1 Administrative AI channel, a distinct
// surface from classService.js's group-chat getClassMessages/sendClassMessage.
import { apiRequest } from "./apiClient";

export async function getDmThread(classId) {
  const body = await apiRequest(`/classes/${classId}/dm`, { auth: true });
  return body.data;
}

export async function sendDmMessage(classId, content) {
  const body = await apiRequest(`/classes/${classId}/dm`, {
    method: "POST",
    payload: { content },
    auth: true,
  });
  return body.data;
}
