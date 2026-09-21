/**
 * Firestore Utilities & Helpers
 * Provides clean payload sanitization and unified error mapping.
 */

export function cleanFirestorePayload<T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        cleaned[key] = cleanFirestorePayload(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}
