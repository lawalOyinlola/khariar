/**
 * Utility functions for error handling
 */

/**
 * Extracts a user-friendly error message from an error object
 */
export function extractErrorMessage(error: unknown, defaultMessage: string = "An unexpected error occurred"): string {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}

/**
 * Formats an error message with optional context
 */
export function formatErrorMessage(
  error: unknown,
  context?: string,
  defaultMessage: string = "An unexpected error occurred"
): string {
  const message = extractErrorMessage(error, defaultMessage);
  return context ? `${context}: ${message}` : message;
}

/**
 * Checks if an error is a specific type
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
