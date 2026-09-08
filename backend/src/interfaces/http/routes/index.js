// Aggregates all route modules into a single router mounted by the app.
const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const classesRoutes = require("./classes.routes");
const directMessagesRoutes = require("./directMessages.routes");
const materialsRoutes = require("./materials.routes");
const progressRoutes = require("./progress.routes");
const assessmentsRoutes = require("./assessments.routes");
const learningPathRoutes = require("./learningPath.routes");
const assignmentsRoutes = require("./assignments.routes");
const adminRoutes = require("./admin.routes");
const aiRoutes = require("./ai.routes");
const lecturerRoutes = require("./lecturer.routes");
const questionsRoutes = require("./questions.routes");
const studentRoutes = require("./student.routes");
const insightsRoutes = require("./insights.routes");

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(classesRoutes);
router.use(directMessagesRoutes);
router.use(materialsRoutes);
router.use(progressRoutes);
router.use(assessmentsRoutes);
router.use(learningPathRoutes);
router.use(assignmentsRoutes);
router.use(adminRoutes);
router.use(aiRoutes);
router.use(lecturerRoutes);
router.use(questionsRoutes);
router.use(studentRoutes);
router.use(insightsRoutes);

module.exports = router;
