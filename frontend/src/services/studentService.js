// Talks to the /student/* endpoints (see backend/src/interfaces/http/routes/student.routes.js).
import { apiRequest } from "./apiClient";

export async function updateStudentProfile(payload) {
  const body = await apiRequest("/student/profile", {
    method: "PATCH",
    payload,
    auth: true,
  });
  return body.data;
}
