// Single shared Socket.io client per namespace — connect after auth, disconnect on logout.
// Callers must always go through getSocket()/disconnectSocket() rather than calling io()
// directly, so a namespace never ends up with more than one live connection.
import { io } from "socket.io-client";
import { getSession } from "./session";

const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_BASE_URL || "http://localhost:4000";

const sockets = {};

export function getSocket(namespace) {
  if (sockets[namespace]) return sockets[namespace];

  const session = getSession();
  if (!session?.accessToken) return null;

  const socket = io(`${SOCKET_BASE_URL}${namespace}`, {
    auth: { token: session.accessToken },
  });
  sockets[namespace] = socket;
  return socket;
}

export function disconnectSocket(namespace) {
  sockets[namespace]?.disconnect();
  delete sockets[namespace];
}

export function disconnectAllSockets() {
  Object.keys(sockets).forEach(disconnectSocket);
}
