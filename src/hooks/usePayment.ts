import {
  initialize,
  PaymentSession,
  presentEntirePaymentFlow,
} from "airwallex-payment-react-native";
import { useState } from "react";
import { Alert } from "react-native";
import { paymentService } from "../services/PaymentService";

// Initialize Airwallex SDK
initialize({
  environment: "demo",
  // returnUrl: "travelling://payment-result"
} as any);

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const startPayment = async (
    bookingId: string,
    amount: number,
    currency: string = "USD",
    customerId?: string
  ): Promise<{
    success: boolean;
    status?: string;
    paymentIntentId?: string;
    error?: string;
  }> => {
    setIsProcessing(true);
    try {
      // 1. Create Payment Intent via Backend
      const { clientSecret, intentId } =
        await paymentService.createPaymentIntent({
          amount,
          currency,
          orderId: bookingId,
          customerId,
        });

      if (!clientSecret || !intentId) {
        throw new Error("Failed to initialize payment session");
      }

      // 2. Prepare Session
      const session: PaymentSession = {
        type: "OneOff",
        paymentIntentId: intentId,
        clientSecret: clientSecret,
        currency: currency,
        countryCode: "US", // Or dynamic based on user
        amount: amount,
        returnUrl: "travelling://payment-result",
        isBillingRequired: true,
      };

      // 3. Launch Native UI
      const result = await presentEntirePaymentFlow(session);

      console.log("Payment Result:", result);

      if (result.status === "success") {
        return {
          success: true,
          status: "succeeded",
          paymentIntentId: intentId,
        };
      } else if (result.status === "cancelled") {
        return { success: false, status: "cancelled" };
      } else {
        // Safe access to error with fallback
        const errMsg =
          (result as any).error?.message || "Unknown payment error";
        return { success: false, status: "failed", error: errMsg };
      }
    } catch (error: any) {
      console.error("Payment Flow Error:", error);
      Alert.alert("Error", error.message || "Payment initialization failed");
      return { success: false, status: "failed", error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startPayment,
    isProcessing,
  };
};
