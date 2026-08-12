// Lecturers join a personal room here so the Lecturer Dashboard gets live stats/pending/activity
// pushes, plus a room per class they own so class chat messages sent via REST reach them live.
const socketAuthMiddleware = require("../auth.middleware");
const {
  registerClassesNamespace,
  sendLecturerSnapshot,
} = require("../emitters");
const MongoClassRepository = require("../../infrastructure/repositories/MongoClassRepository");

const classRepository = new MongoClassRepository();

function initClassesNamespace(io) {
  const namespace = io.of("/classes");

  namespace.use(socketAuthMiddleware);
  namespace.use((socket, next) => {
    if (!["student", "lecturer"].includes(socket.user.role)) {
      return next(new Error("Student or lecturer role required."));
    }
    next();
  });

  namespace.on("connection", (socket) => {
    if (socket.user.role === "lecturer") {
      socket.join(`lecturer:${socket.user.id}`);
      sendLecturerSnapshot(socket.user.id).catch(() => {});

      classRepository
        .findByLecturer(socket.user.id)
        .then((classes) => {
          classes.forEach((classDoc) => socket.join(`class:${classDoc.id}`));
        })
        .catch(() => {});
    } else if (socket.user.role === "student") {
      socket.join(`student:${socket.user.id}`);

      classRepository
        .findEnrollmentsByStudent(socket.user.id)
        .then((enrollments) => {
          enrollments.forEach((enrollment) => {
            if (enrollment.classId)
              socket.join(`class:${enrollment.classId.id}`);
          });
        })
        .catch(() => {});
    }
    // Message *sending* stays REST-only (see sendClassMessage + emitClassMessage) — sockets are
    // read-only here, no client-initiated events beyond joining rooms on connect.
  });

  registerClassesNamespace(namespace);
  return namespace;
}

module.exports = initClassesNamespace;
