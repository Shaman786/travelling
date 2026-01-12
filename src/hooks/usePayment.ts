/**
 * usePayment Hook
 *
 * React hook for managing Airwallex payment flow.
 * Handles payment initialization, processing, and status updates.
 *
 * @module hooks/usePayment
 */

import { useCallback, useState } from "react";
import {
  airwallexService,
  type AirwallexPaymentResult,
} from "../lib/airwallex";
import { bookingService, paymentService } from "../lib/databaseService";
import { ERROR_CODES, handleError } from "../lib/errors";
import { useStore } from "../store/useStore";

interface UsePaymentReturn {
  isProcessing: boolean;
  error: string | null;
  initiatePayment: (
    bookingId: string,
    amount: number,
    currency?: string
  ) => Promise<AirwallexPaymentResult>;
}

/**
 * Hook to manage Airwallex payment flow
 *
 * @example
 * ```tsx
 * const { initiatePayment, isProcessing, error } = usePayment();
 *
 * const handlePay = async () => {
 *   const result = await initiatePayment(booking.$id, 1500, 'USD');
 *   if (result.status === 'success') {
 *     // Navigate to success screen
 *   }
 * };
 * ```
 */
export function usePayment(): UsePaymentReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const updateBookedTrip = useStore((state) => state.updateBookedTrip);

  const initiatePayment = useCallback(
    async (
      bookingId: string,
      amount: number,
      currency: string = "USD"
    ): Promise<AirwallexPaymentResult> => {
      if (!user?.$id) {
        return {
          status: "cancelled",
          error: ERROR_CODES.AUTH_NOT_LOGGED_IN.message,
        };
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Step 1: Create a payment record with pending status
        const payment = await paymentService.createPayment({
          bookingId,
          userId: user.$id,
          amount,
          currency,
          gatewayProvider: "airwallex",
        });

        // Step 2: Create PaymentIntent via Appwrite Function
        // This securely creates the PaymentIntent using the server-side function
        const { paymentIntentId, clientSecret } =
          await airwallexService.createPaymentIntent(
            amount,
            currency,
            bookingId,
            user.$id
          );

        // Update payment with intent ID
        await paymentService.updatePayment(payment.$id, {
          gatewayOrderId: paymentIntentId,
          status: "processing",
        });

        // Step 3: Present Airwallex payment UI
        const result = await airwallexService.presentPaymentFlow({
          paymentIntentId,
          clientSecret,
          amount,
          currency,
          customerId: user.$id,
        });

        // Step 4: Handle result
        if (result.status === "success") {
          // Update payment status
          await paymentService.updatePayment(payment.$id, {
            gatewayPaymentId: result.paymentIntentId,
            status: "completed",
          });

          // Update booking status
          const updatedBooking = await bookingService.updateBookingStatus(
            bookingId,
            "processing",
            "Payment completed via Airwallex"
          );
          await bookingService.updatePaymentStatus(
            bookingId,
            "paid",
            result.paymentIntentId
          );

          updateBookedTrip(bookingId, updatedBooking);

          return { status: "success", paymentIntentId: result.paymentIntentId };
        } else if (result.status === "cancelled") {
          // User cancelled payment
          await paymentService.updatePayment(payment.$id, {
            status: "failed",
            metadata: JSON.stringify({ reason: "User cancelled" }),
          });

          return { status: "cancelled" };
        } else {
          // Payment in progress (redirect flow)
          return { status: "inProgress", paymentIntentId };
        }
      } catch (err: unknown) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        return {
          status: "cancelled",
          error: ERROR_CODES.PAYMENT_FAILED.message,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [user?.$id, updateBookedTrip]
  );

  return {
    isProcessing,
    error,
    initiatePayment,
  };
}

export default usePayment;
