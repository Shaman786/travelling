/**
 * Airwallex Payment Service
 *
 * Integrates Airwallex SDK for payment processing.
 * Supports card payments, Apple Pay, and Google Pay.
 *
 * @module lib/airwallexService
 */

import type { PaymentSession } from "airwallex-payment-react-native";
import {
  initialize,
  presentEntirePaymentFlow,
} from "airwallex-payment-react-native";
import Constants from "expo-constants";

import { functions, FUNCTIONS } from "./appwrite";

// Environment configuration
const AIRWALLEX_ENVIRONMENT =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_AIRWALLEX_ENVIRONMENT ||
  process.env.EXPO_PUBLIC_AIRWALLEX_ENVIRONMENT ||
  "demo";

/**
 * Initialize Airwallex SDK
 * Should be called once at app startup
 */
export function initializeAirwallex(): void {
  try {
    // Initialize with environment string
    initialize(AIRWALLEX_ENVIRONMENT as "demo" | "staging" | "production");
    console.log(
      "[Airwallex] SDK initialized in",
      AIRWALLEX_ENVIRONMENT,
      "mode"
    );
  } catch (error) {
    console.error("[Airwallex] Failed to initialize SDK:", error);
  }
}

/**
 * Payment result from Airwallex
 */
export interface AirwallexPaymentResult {
  status: "success" | "inProgress" | "cancelled";
  paymentIntentId?: string;
  error?: string;
}

/**
 * Options for initiating a payment
 */
export interface AirwallexPaymentOptions {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  countryCode?: string;
  customerId?: string;
  isBillingRequired?: boolean;
}

/**
 * Present the Airwallex payment flow
 *
 * @param options - Payment options including intent ID and client secret
 * @returns Promise resolving to payment result
 *
 * @example
 * ```typescript
 * const result = await presentPaymentFlow({
 *   paymentIntentId: 'int_xxx',
 *   clientSecret: 'secret_xxx',
 *   amount: 1500,
 *   currency: 'USD',
 * });
 *
 * if (result.status === 'success') {
 *   // Payment successful
 * }
 * ```
 */
export async function presentPaymentFlow(
  options: AirwallexPaymentOptions
): Promise<AirwallexPaymentResult> {
  const session: PaymentSession = {
    type: "OneOff",
    paymentIntentId: options.paymentIntentId,
    clientSecret: options.clientSecret,
    amount: options.amount,
    currency: options.currency,
    countryCode: options.countryCode || "US",
    customerId: options.customerId,
    isBillingRequired: options.isBillingRequired ?? false,
    paymentMethods: ["card"],
  };

  try {
    const result = await presentEntirePaymentFlow(session);

    return {
      status: result.status,
      paymentIntentId: options.paymentIntentId,
    };
  } catch (error: any) {
    console.error("[Airwallex] Payment error:", error);
    return {
      status: "cancelled",
      error: error.message || "Payment failed",
    };
  }
}

/**
 * Create a PaymentIntent via Appwrite Function
 *
 * This calls the serverless function which securely creates
 * the PaymentIntent with Airwallex API.
 *
 * @param amount - Amount in cents (e.g., 1500 for $15.00)
 * @param currency - Currency code (e.g., 'USD')
 * @param bookingId - Optional booking reference
 * @param userId - Optional user ID
 * @returns PaymentIntent ID and client secret
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  bookingId?: string,
  userId?: string
): Promise<{ paymentIntentId: string; clientSecret: string }> {
  console.log("[Airwallex] Creating PaymentIntent via Appwrite Function...");

  try {
    const execution = await functions.createExecution(
      FUNCTIONS.CREATE_PAYMENT_INTENT,
      JSON.stringify({ amount, currency, bookingId, userId }),
      false // Don't wait for async execution
    );

    // Parse response
    const response = JSON.parse(execution.responseBody || "{}");

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.paymentIntentId || !response.clientSecret) {
      throw new Error("Invalid response from payment function");
    }

    console.log("[Airwallex] PaymentIntent created:", response.paymentIntentId);

    return {
      paymentIntentId: response.paymentIntentId,
      clientSecret: response.clientSecret,
    };
  } catch (error: any) {
    console.error("[Airwallex] Failed to create PaymentIntent:", error);
    throw new Error(error.message || "Failed to create payment intent");
  }
}

/**
 * Airwallex service singleton
 */
export const airwallexService = {
  initialize: initializeAirwallex,
  presentPaymentFlow,
  createPaymentIntent,
};

export default airwallexService;
