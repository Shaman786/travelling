import { customAlphabet } from "nanoid";
import { ulid } from "ulidx";

// Base32-like alphabet (avoiding I, 1, O, 0 for readability)
const readableAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const generateShortCode = customAlphabet(readableAlphabet, 8);

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier)
 * Use this for Database PKs, Transaction IDs, and extensive Log IDs.
 * Format: 26 characters (e.g., 01ARZ3NDEKTSV4RRFFQ69G5FAV)
 */
export const generateId = (): string => {
  return ulid();
};

/**
 * Generate a user-facing Booking Reference
 * Format: TRP-XXXXXXXX (e.g., TRP-9F2K7Q3X)
 * Short, readable, and easy to dictate.
 */
export const generateBookingRef = (): string => {
  return `TRP-${generateShortCode()}`;
};

/**
 * Generate a Transaction ID for payments/accounting
 * Format: TXN-ULID (e.g., TXN-01HF9ZP0G5RZ8X2YQ4M8T0VQJX)
 */
export const generateTransactionId = (): string => {
  return `TXN-${ulid()}`;
};
