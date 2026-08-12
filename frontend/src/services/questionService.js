// Talks to the /questions endpoints (see backend/src/interfaces/http/routes/questions.routes.js).
import { apiRequest } from "./apiClient";

export async function getQuestions(status) {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const body = await apiRequest(`/questions${query}`, { auth: true });
  return body.data;
}

export async function respondToQuestion(
  questionId,
  { status, lecturerResponse },
) {
  const body = await apiRequest(`/questions/${questionId}`, {
    method: "PATCH",
    payload: { status, lecturerResponse },
    auth: true,
  });
  return body.data;
}

export async function submitQuestion({ classId, questionText }) {
  const body = await apiRequest("/questions", {
    method: "POST",
    payload: { classId, questionText },
    auth: true,
  });
  return body.data;
}

export async function getMyQuestions() {
  const body = await apiRequest("/questions/mine", { auth: true });
  return body.data;
}
