// Use-case: aggregate class/student counts for the lecturer's own classes.
async function getLecturerDashboardStats({ classRepository }, { lecturerId }) {
  const classes = await classRepository.findByLecturer(lecturerId);
  const classCount = classes.length;
  const studentCount = classes.reduce(
    (sum, classDoc) => sum + (classDoc.studentCount || 0),
    0,
  );
  return { classCount, studentCount };
}

module.exports = getLecturerDashboardStats;
