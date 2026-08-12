// Talks to the admin-only endpoints (see backend/src/interfaces/http/routes/admin.routes.js).
import { apiRequest } from "./apiClient";

export async function getAdminStats() {
  const body = await apiRequest("/admin/stats", { auth: true });
  return body.data;
}

export async function getRecentUsers() {
  const body = await apiRequest("/admin/users", { auth: true });
  return body.data;
}

export async function getAiServiceStatus() {
  const body = await apiRequest("/admin/ai-status", { auth: true });
  return body.data;
}

// Per-agent MAS-engine status (same shape pushed live via admin:ai-status:update) — distinct
// from getAiServiceStatus() above, which only reports a plain reachable boolean.
export async function getAiStatus() {
  const body = await apiRequest("/ai/status", { auth: true });
  return body.data;
}

export async function getUsersList({
  page = 1,
  limit = 20,
  search = "",
  role = "",
} = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  const body = await apiRequest(`/admin/users/list?${params.toString()}`, {
    auth: true,
  });
  return body.data;
}

export async function getClassesOverview() {
  const body = await apiRequest("/admin/classes", { auth: true });
  return body.data;
}

export async function getSystemInfo() {
  const body = await apiRequest("/admin/system", { auth: true });
  return body.data;
}
