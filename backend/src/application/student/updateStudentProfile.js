// Use-case: update a student's own profile — name only. Student ID is intentionally never
// accepted here (it isn't self-editable once set), even if present in the request body.
async function updateStudentProfile(
  { userRepository },
  { studentId, firstName, lastName },
) {
  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;

  const updated = await userRepository.updateProfile(studentId, updates);
  return {
    id: updated.id.toString(),
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    studentId: updated.studentId ?? "",
  };
}

module.exports = updateStudentProfile;
