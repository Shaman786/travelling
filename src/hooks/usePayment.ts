/**
 * usePayment Hook
 *
 * Safe payment hook that gracefully handles cases where the Airwallex SDK
 * native module may not be properly configured.
 */
import { useCallback, useState } from "react";
import { Alert, NativeModules } from "react-native";
import { paymentService } from "../services/PaymentService";

// Check if native module is available at startup
const isAirwallexAvailable = (): boolean => {
  try {
    // Check if the native module exists
    const hasNativeModule =
      !!NativeModules.AirwallexSdk ||
      !!NativeModules.AirwallexPayment ||
      !!NativeModules.RNAirwallexSdk;
    return hasNativeModule;
  } catch {
    return false;
  }
};

const AIRWALLEX_AVAILABLE = isAirwallexAvailable();

// Lazy load the SDK only after confirming native module exists
let airwallexSDK: any = null;
let sdkLoadError: string | null = null;

const loadAirwallexSDK = async (): Promise<boolean> => {
  if (airwallexSDK) return true;
  if (sdkLoadError) return false;

  if (!AIRWALLEX_AVAILABLE) {
    sdkLoadError = "Airwallex SDK native module not configured";
    console.warn("Airwallex SDK not available - payments will be disabled");
    return false;
  }

  try {
    const sdk = await import("airwallex-payment-react-native");
    sdk.initialize("demo"); // Must be string, not object!
    airwallexSDK = sdk;
    console.log("Airwallex SDK loaded successfully");
    return true;
  } catch (error: any) {
    sdkLoadError = error?.message || "Failed to load payment SDK";
    console.error("Airwallex SDK load error:", error);
    return false;
  }
};

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const startPayment = useCallback(
    async (
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
      // Pre-check native module availability
      if (!AIRWALLEX_AVAILABLE) {
        Alert.alert(
          "Payment Setup Required",
          "The payment system is not configured for this build. Please contact support or use an alternate payment method.",
          [{ text: "OK" }]
        );
        return {
          success: false,
          status: "unavailable",
          error: "Payment SDK not configured",
        };
      }

      // Try to load SDK
      const loaded = await loadAirwallexSDK();
      if (!loaded || !airwallexSDK) {
        Alert.alert(
          "Payment Unavailable",
          sdkLoadError ||
            "Unable to initialize payment system. Please try again later."
        );
        return {
          success: false,
          status: "failed",
          error: sdkLoadError || "SDK load failed",
        };
      }

      setIsProcessing(true);
      try {
        // Create Payment Intent via Backend
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

        // Prepare Session
        const session = {
          type: "OneOff",
          paymentIntentId: intentId,
          clientSecret: clientSecret,
          currency: currency,
          countryCode: "US",
          amount: amount,
          returnUrl: "travelling://payment-result",
          isBillingRequired: true,
        };

        // Launch Native Payment UI
        const result = await airwallexSDK.presentEntirePaymentFlow(session);

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
          const errMsg =
            (result as any).error?.message || "Unknown payment error";
          return { success: false, status: "failed", error: errMsg };
        }
      } catch (error: any) {
        console.error("Payment Flow Error:", error);
        Alert.alert(
          "Payment Error",
          error.message || "Payment initialization failed"
        );
        return { success: false, status: "failed", error: error.message };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    startPayment,
    isProcessing,
    isAvailable: AIRWALLEX_AVAILABLE,
  };
};
