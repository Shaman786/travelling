/**
 * Error Codes and User-Friendly Messages
 *
 * Centralized error handling with codes for debugging
 * and friendly messages for end users.
 *
 * @module lib/errors
 */

/**
 * Error code categories:
 * - AUTH: Authentication errors (1xxx)
 * - BOOKING: Booking flow errors (2xxx)
 * - PAYMENT: Payment errors (3xxx)
 * - NETWORK: Network/API errors (4xxx)
 * - STORAGE: File/storage errors (5xxx)
 * - VALIDATION: Input validation errors (6xxx)
 */

export interface AppError {
  code: string;
  message: string; // User-friendly message
  technicalMessage?: string; // Developer message (logged only)
}

export const ERROR_CODES = {
  // ============ AUTHENTICATION (1xxx) ============
  AUTH_INVALID_CREDENTIALS: {
    code: "E1001",
    message: "Invalid email or password. Please try again.",
  },
  AUTH_SESSION_EXPIRED: {
    code: "E1002",
    message: "Your session has expired. Please log in again.",
  },
  AUTH_EMAIL_EXISTS: {
    code: "E1003",
    message: "This email is already registered. Try logging in instead.",
  },
  AUTH_WEAK_PASSWORD: {
    code: "E1004",
    message: "Password must be at least 8 characters with a number.",
  },
  AUTH_NOT_LOGGED_IN: {
    code: "E1005",
    message: "Please log in to continue.",
  },
  AUTH_VERIFICATION_FAILED: {
    code: "E1006",
    message: "Email verification failed. Please try again.",
  },

  // ============ BOOKING (2xxx) ============
  BOOKING_CREATE_FAILED: {
    code: "E2001",
    message: "We couldn't create your booking. Please try again.",
  },
  BOOKING_NOT_FOUND: {
    code: "E2002",
    message: "Booking not found. It may have been cancelled.",
  },
  BOOKING_ALREADY_CANCELLED: {
    code: "E2003",
    message: "This booking has already been cancelled.",
  },
  BOOKING_CANNOT_CANCEL: {
    code: "E2004",
    message: "This booking cannot be cancelled at this stage.",
  },
  BOOKING_INVALID_DATES: {
    code: "E2005",
    message: "Please select valid travel dates.",
  },
  BOOKING_NO_TRAVELERS: {
    code: "E2006",
    message: "Please add at least one traveler to continue.",
  },
  BOOKING_PACKAGE_UNAVAILABLE: {
    code: "E2007",
    message: "This package is no longer available.",
  },

  // ============ PAYMENT (3xxx) ============
  PAYMENT_FAILED: {
    code: "E3001",
    message: "Payment failed. Please check your card details and try again.",
  },
  PAYMENT_CANCELLED: {
    code: "E3002",
    message: "Payment was cancelled. Your booking is saved as pending.",
  },
  PAYMENT_INTENT_FAILED: {
    code: "E3003",
    message: "Unable to initialize payment. Please try again later.",
  },
  PAYMENT_INSUFFICIENT_FUNDS: {
    code: "E3004",
    message: "Insufficient funds. Please use a different payment method.",
  },
  PAYMENT_CARD_DECLINED: {
    code: "E3005",
    message: "Your card was declined. Please try a different card.",
  },
  PAYMENT_EXPIRED_CARD: {
    code: "E3006",
    message: "Your card has expired. Please use a valid card.",
  },
  PAYMENT_REFUND_FAILED: {
    code: "E3007",
    message: "Refund could not be processed. Please contact support.",
  },

  // ============ NETWORK (4xxx) ============
  NETWORK_OFFLINE: {
    code: "E4001",
    message: "No internet connection. Please check your network.",
  },
  NETWORK_TIMEOUT: {
    code: "E4002",
    message: "Request timed out. Please try again.",
  },
  NETWORK_SERVER_ERROR: {
    code: "E4003",
    message: "Something went wrong on our end. Please try again later.",
  },
  NETWORK_SERVICE_UNAVAILABLE: {
    code: "E4004",
    message: "Service temporarily unavailable. Please try again shortly.",
  },

  // ============ STORAGE (5xxx) ============
  STORAGE_UPLOAD_FAILED: {
    code: "E5001",
    message: "Failed to upload file. Please try again.",
  },
  STORAGE_FILE_TOO_LARGE: {
    code: "E5002",
    message: "File is too large. Maximum size is 5MB.",
  },
  STORAGE_INVALID_FORMAT: {
    code: "E5003",
    message: "Invalid file format. Please use JPG, PNG, or PDF.",
  },
  STORAGE_DOWNLOAD_FAILED: {
    code: "E5004",
    message: "Failed to download file. Please try again.",
  },

  // ============ VALIDATION (6xxx) ============
  VALIDATION_REQUIRED_FIELD: {
    code: "E6001",
    message: "Please fill in all required fields.",
  },
  VALIDATION_INVALID_EMAIL: {
    code: "E6002",
    message: "Please enter a valid email address.",
  },
  VALIDATION_INVALID_PHONE: {
    code: "E6003",
    message: "Please enter a valid phone number.",
  },
  VALIDATION_INVALID_PASSPORT: {
    code: "E6004",
    message: "Please enter a valid passport number.",
  },
  VALIDATION_FUTURE_DATE: {
    code: "E6005",
    message: "Please select a future date.",
  },
  VALIDATION_PAST_EXPIRY: {
    code: "E6006",
    message: "Document has expired. Please provide a valid document.",
  },

  // ============ GENERAL (9xxx) ============
  UNKNOWN_ERROR: {
    code: "E9999",
    message: "Something went wrong. Please try again or contact support.",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Create a standardized app error
 */
export function createAppError(
  errorCode: ErrorCode,
  technicalMessage?: string
): AppError {
  const errorDef = ERROR_CODES[errorCode];
  return {
    code: errorDef.code,
    message: errorDef.message,
    technicalMessage,
  };
}

/**
 * Get user-friendly message from any error
 * Logs technical details (including code) for debugging
 */
export function getErrorMessage(error: unknown): string {
  // If it's already our AppError
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    const appError = error as AppError;
    // Log code and technical details for debugging
    console.error(
      `[${appError.code}]`,
      appError.technicalMessage || appError.message
    );
    // Return only the user-friendly message
    return appError.message;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    console.error("[Error]", error.message);

    // Map common technical errors to user-friendly messages
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch")) {
      return ERROR_CODES.NETWORK_OFFLINE.message;
    }
    if (msg.includes("timeout")) {
      return ERROR_CODES.NETWORK_TIMEOUT.message;
    }
    if (msg.includes("unauthorized") || msg.includes("401")) {
      return ERROR_CODES.AUTH_SESSION_EXPIRED.message;
    }
    if (msg.includes("not found") || msg.includes("404")) {
      return ERROR_CODES.BOOKING_NOT_FOUND.message;
    }
    if (msg.includes("500") || msg.includes("server")) {
      return ERROR_CODES.NETWORK_SERVER_ERROR.message;
    }
  }

  // Fallback
  console.error("[Unknown Error]", error);
  return ERROR_CODES.UNKNOWN_ERROR.message;
}

/**
 * Helper to handle errors in catch blocks
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   Toast.error(handleError(error));
 * }
 * ```
 */
export function handleError(error: unknown): string {
  return getErrorMessage(error);
}

export default ERROR_CODES;
