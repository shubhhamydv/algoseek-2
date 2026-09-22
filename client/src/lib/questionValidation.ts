export const MIN_LECTURE_QUESTION_LENGTH = 3;

export function validateLectureQuestion(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return "Enter a DSA question to search the lectures.";
  if (normalized.length < MIN_LECTURE_QUESTION_LENGTH) return "Please enter at least 3 characters.";
  return null;
}
