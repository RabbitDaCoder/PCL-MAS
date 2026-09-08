// Use-case: items requiring lecturer action. Currently surfaces one item per class that has
// pending improvement insights awaiting review.
async function getLecturerPendingActions(
  { classRepository, approvalRepository },
  { lecturerId },
) {
  const classes = await classRepository.findByLecturer(lecturerId);

  const pendingCounts = await Promise.all(
    classes.map(async (classDoc) => {
      const pending = await approvalRepository.findByClass(classDoc.id, "pending");
      const insightCount = pending.filter(
        (approval) => approval.requestType === "improvement-insight",
      ).length;
      return { classDoc, insightCount };
    }),
  );

  return pendingCounts
    .filter(({ insightCount }) => insightCount > 0)
    .map(({ classDoc, insightCount }) => ({
      id: `insights-${classDoc.id.toString()}`,
      label: `${insightCount} improvement insight${insightCount === 1 ? "" : "s"} awaiting review in ${classDoc.name}`,
      actionHref: `/lecturer/classes/${classDoc.id.toString()}/insights`,
      actionLabel: "Review",
    }));
}

module.exports = getLecturerPendingActions;
