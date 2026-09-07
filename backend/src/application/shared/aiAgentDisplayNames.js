// Display name per AI agent persona — shared by class-group chat and 1:1 DM message summaries,
// so the chat UI always shows which agent actually authored a message instead of one generic
// AI identity.
const AI_AGENT_DISPLAY_NAMES = {
  Admin: "Administrative AI",
  Instructor: "Instructor AI",
  Lecturer: "Lecturer AI",
  System: "AI Assistant",
};

module.exports = { AI_AGENT_DISPLAY_NAMES };
