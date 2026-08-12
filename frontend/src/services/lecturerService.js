// Talks to the /lecturer/* endpoints (see backend/src/interfaces/http/routes/lecturer.routes.js).
import { apiRequest } from "./apiClient";

export async function getLecturerDashboardStats() {
  const body = await apiRequest("/lecturer/dashboard-stats", { auth: true });
  return body.data;
}

export async function getLecturerPendingActions() {
  const body = await apiRequest("/lecturer/pending-actions", { auth: true });
  return body.data;
}

export async function getLecturerActivity() {
  const body = await apiRequest("/lecturer/activity", { auth: true });
  return body.data;
}

export async function updateLecturerProfile(payload) {
  const body = await apiRequest("/lecturer/profile", {
    method: "PATCH",
    payload,
    auth: true,
  });
  return body.data;
}
