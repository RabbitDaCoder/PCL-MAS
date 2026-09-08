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

export async function submitDmMessageFeedback(classId, messageId, { rating, note }) {
  const body = await apiRequest(
    `/classes/${classId}/dm/${messageId}/feedback`,
    {
      method: "POST",
      payload: { rating, note },
      auth: true,
    },
  );
  return body.data;
}
