// Detects an explicit "@admin" / "@instructor" / "@lecturer" mention in a student's message —
// shared by class-group chat and the 1:1 DM channel, so a student can call a specific agent's
// attention in either surface instead of waiting on the Lecturer AI's own routing judgment.
const MENTION_PATTERNS = [
  { pattern: /@(administrative|admin)\b/i, agent: "Admin" },
  { pattern: /@instructor\b/i, agent: "Instructor" },
  { pattern: /@lecturer\b/i, agent: "Lecturer" },
];

function parseAgentMention(content) {
  if (!content) return null;
  for (const { pattern, agent } of MENTION_PATTERNS) {
    if (pattern.test(content)) return agent;
  }
  return null;
}

module.exports = parseAgentMention;
