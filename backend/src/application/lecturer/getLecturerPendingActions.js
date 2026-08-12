// Use-case: items requiring lecturer action. No Question/Approval model exists yet, so this is
// real plumbing wired end to end that legitimately returns an empty list for now.
async function getLecturerPendingActions() {
  // TODO: populate once question review ships
  return [];
}

module.exports = getLecturerPendingActions;
