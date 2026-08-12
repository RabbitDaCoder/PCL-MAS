// Talks to the real backend auth API (see backend/src/interfaces/http/routes/auth.routes.js).
import { apiRequest } from "./apiClient";
import { getSession, storeSession, clearSession } from "./session";

export { getSession, clearSession };

const DASHBOARD_PATHS = {
  student: "/student/dashboard",
  lecturer: "/lecturer/dashboard",
  admin: "/admin/dashboard",
};

export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || "/";
}

export async function login({ role, email, password }) {
  const body = await apiRequest("/auth/login", {
    method: "POST",
    payload: { email, password, role },
  });
  return storeSession(body.data);
}

// Registration no longer auto-logs the user in — the caller redirects to the login page instead.
export async function registerStudent(payload) {
  const body = await apiRequest("/auth/register", {
    method: "POST",
    payload: {
      role: "student",
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      studentId: payload.studentId,
      institution: payload.institution,
      department: payload.department,
      academicLevel: payload.level,
    },
  });
  return body.data;
}

export async function registerLecturer(payload) {
  const body = await apiRequest("/auth/register", {
    method: "POST",
    payload: {
      role: "lecturer",
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      institution: payload.institution,
      department: payload.department,
      faculty: payload.faculty,
      academicRole: payload.academicRole,
    },
  });
  return body.data;
}

// Fetches the current user from the server rather than trusting/decoding the JWT client-side.
export async function getMe() {
  const body = await apiRequest("/auth/me", { auth: true });
  return body.data;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      payload: {},
      auth: true,
    });
  } finally {
    clearSession();
  }
}

export async function forgotPassword(email) {
  const body = await apiRequest("/auth/forgot-password", {
    method: "POST",
    payload: { email },
  });
  return body.message;
}

export async function resetPassword(token, password) {
  const body = await apiRequest(`/auth/reset-password/${token}`, {
    method: "POST",
    payload: { password },
  });
  return body.message;
}
