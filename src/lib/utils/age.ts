/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string | null | undefined): number | null {
  if (!dateOfBirth) return null;

  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If birthday hasn't occurred this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
