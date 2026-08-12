// Shared fetch wrapper every service module talks through — the standard { success, data,
// message } envelope is unwrapped here once instead of in every call site.
import { getSession } from "./session";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export async function apiRequest(
  path,
  { method = "GET", payload, auth = false } = {},
) {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (auth) {
    const session = getSession();
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData
        ? payload
        : payload !== undefined
          ? JSON.stringify(payload)
          : undefined,
    });
  } catch {
    throw new Error("Couldn't reach the server. Please try again.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    throw new Error(body.message || "Something went wrong. Please try again.");
  }
  return body;
}
