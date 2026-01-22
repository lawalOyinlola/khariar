/**
 * Toast notification utilities using Sonner
 */

import { toast as sonnerToast } from "sonner";
import { extractErrorMessage } from "./error-handler";

/**
 * Shows a success toast notification
 */
export function showSuccess(message: string, description?: string) {
  sonnerToast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * Shows an error toast notification
 */
export function showError(message: string, description?: string) {
  sonnerToast.error(message, {
    description,
    duration: 6000,
  });
}

/**
 * Shows an error toast from an error object
 */
export function showErrorFromException(
  error: unknown,
  defaultMessage: string = "An error occurred",
  context?: string
) {
  const message = extractErrorMessage(error, defaultMessage);
  const fullMessage = context ? `${context}: ${message}` : message;
  showError(fullMessage);
}

/**
 * Shows an info toast notification
 */
export function showInfo(message: string, description?: string) {
  sonnerToast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * Shows a warning toast notification
 */
export function showWarning(message: string, description?: string) {
  sonnerToast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * Shows a loading toast notification
 */
export function showLoading(message: string) {
  return sonnerToast.loading(message);
}

/**
 * Updates a loading toast to success
 */
export function updateToSuccess(
  toastId: string | number,
  message: string,
  description?: string
) {
  sonnerToast.success(message, {
    id: toastId,
    description,
    duration: 4000,
  });
}

/**
 * Updates a loading toast to error
 */
export function updateToError(
  toastId: string | number,
  message: string,
  description?: string
) {
  sonnerToast.error(message, {
    id: toastId,
    description,
    duration: 6000,
  });
}

/**
 * Dismisses a toast
 */
export function dismissToast(toastId: string | number) {
  sonnerToast.dismiss(toastId);
}
