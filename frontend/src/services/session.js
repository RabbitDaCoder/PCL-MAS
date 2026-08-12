// Reads/writes the persisted session; the single source of truth for "am I logged in" on disk.
const SESSION_KEY = "pclmas.session";

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function storeSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
