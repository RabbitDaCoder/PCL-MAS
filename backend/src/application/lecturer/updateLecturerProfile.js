// Use-case: update a lecturer's own profile fields — name/department/institution only. Email and
// password are deliberately excluded here; those belong on more carefully guarded endpoints.
async function updateLecturerProfile(
  { userRepository },
  { lecturerId, firstName, lastName, department, institution },
) {
  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (department !== undefined) updates.department = department;
  if (institution !== undefined) updates.institution = institution;

  const updated = await userRepository.updateProfile(lecturerId, updates);
  return {
    id: updated.id.toString(),
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    department: updated.department ?? "",
    institution: updated.institution ?? "",
  };
}

module.exports = updateLecturerProfile;
