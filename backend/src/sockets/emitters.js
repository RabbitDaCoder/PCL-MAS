// Bridges REST use-cases -> live Socket.io push, so route handlers don't need to import
// Socket.io directly. Owns its own repository instances purely for recomputing stats after a
// mutation (kept separate from authController's deps to avoid coupling auth to admin concerns).
const MongoUserRepository = require("../infrastructure/repositories/MongoUserRepository");
const MongoClassRepository = require("../infrastructure/repositories/MongoClassRepository");
const getStats = require("../application/admin/getStats");
const getLecturerDashboardStats = require("../application/lecturer/getLecturerDashboardStats");
const getLecturerPendingActions = require("../application/lecturer/getLecturerPendingActions");
const getLecturerActivity = require("../application/lecturer/getLecturerActivity");

const userRepository = new MongoUserRepository();
const classRepository = new MongoClassRepository();

let adminNamespace = null;
let classesNamespace = null;

function registerAdminNamespace(namespace) {
  adminNamespace = namespace;
}

function registerClassesNamespace(namespace) {
  classesNamespace = namespace;
}

function emitAdminAiStatusUpdate(status) {
  adminNamespace?.emit("admin:ai-status:update", status);
}

// Called when a lecturer's socket connects — pushes their current stats/pending/activity into
// their personal room so the dashboard has live data without waiting on a future mutation.
async function sendLecturerSnapshot(lecturerId) {
  if (!classesNamespace) return;
  const room = `lecturer:${lecturerId}`;

  const stats = await getLecturerDashboardStats(
    { classRepository },
    { lecturerId },
  );
  classesNamespace.to(room).emit("lecturer:stats:update", stats);

  const pending = await getLecturerPendingActions();
  classesNamespace.to(room).emit("lecturer:pending:update", pending);

  const activity = await getLecturerActivity();
  classesNamespace.to(room).emit("lecturer:activity:update", activity);
}

// Called after a successful registration — pushes the new user row and refreshed stats to any
// admins currently watching the dashboard.
// Called after a chat message is persisted via REST — pushes it live to everyone in the class
// room. REST is the single write path; sockets never accept a client-authored send event.
function emitClassMessage(classId, message) {
  classesNamespace?.to(`class:${classId}`).emit("class:message:new", message);
}

// Called whenever a membership changes (invite accepted, self-serve join, or removal). If the
// student just went active, their already-connected socket is joined to the class room
// immediately server-side — no reconnect required for the room join to take effect.
function emitClassMembershipUpdate(classId, studentId, payload) {
  if (!classesNamespace) return;
  if (payload.status === "active") {
    classesNamespace.in(`student:${studentId}`).socketsJoin(`class:${classId}`);
  }
  classesNamespace
    .to(`class:${classId}`)
    .emit("class:membership:update", payload);
  classesNamespace
    .to(`student:${studentId}`)
    .emit("class:membership:update", payload);
}

// Called after a lecturer responds to a question — pushes the update to that student's personal
// room so the Ask page updates live without a refresh.
function emitQuestionAnswered(studentId, question) {
  classesNamespace
    ?.to(`student:${studentId}`)
    .emit("question:answered", question);
}

// Called after a DirectMessage (1:1 Administrative AI thread) is persisted — pushes it to the
// student's personal room only, never the class room (this channel isn't visible to the group).
function emitDmMessage(studentId, message) {
  classesNamespace?.to(`student:${studentId}`).emit("dm:message:new", message);
}

// Minimal event ahead of Part H's full Notification model — same room/naming pattern Part H will
// adopt, so Part H only needs to add persistence, not rewire delivery.
function emitNotification(studentId, notification) {
  classesNamespace
    ?.to(`student:${studentId}`)
    .emit("notification:new", notification);
}

async function notifyUserRegistered(user) {
  if (!adminNamespace) return;

  adminNamespace.emit("admin:user:new", {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt ?? new Date().toISOString(),
  });

  const stats = await getStats({ userRepository, classRepository });
  adminNamespace.emit("admin:stats:update", stats);
}

module.exports = {
  registerAdminNamespace,
  registerClassesNamespace,
  emitAdminAiStatusUpdate,
  sendLecturerSnapshot,
  emitClassMessage,
  emitClassMembershipUpdate,
  emitQuestionAnswered,
  emitDmMessage,
  emitNotification,
  notifyUserRegistered,
};
