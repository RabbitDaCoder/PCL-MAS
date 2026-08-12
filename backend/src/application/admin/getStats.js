// Use-case: simple aggregate counts for the admin overview — no PII, just totals.
async function getStats({ userRepository, classRepository }) {
  const [totalUsers, totalStudents, totalLecturers, totalClasses] =
    await Promise.all([
      userRepository.countAll(),
      userRepository.countByRole("student"),
      userRepository.countByRole("lecturer"),
      classRepository.countAll(),
    ]);

  return { totalUsers, totalStudents, totalLecturers, totalClasses };
}

module.exports = getStats;
