import { functions, FUNCTIONS } from "../lib/appwrite";

export const paymentService = {
  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    customerId?: string;
    userId?: string;
  }) {
    try {
      console.log(`Creating Payment Intent via Appwrite Function...`);

      // Amount is expected in CENTS.
      // We removed ambiguity by enforcing 'amountCents' in the parameter.
      const centsAmount = Math.round(params.amountCents);

      const execution = await functions.createExecution(
        FUNCTIONS.CREATE_PAYMENT_INTENT,
        JSON.stringify({
          amount: centsAmount,
          currency: params.currency,
          bookingId: params.orderId,
          userId: params.userId || "guest",
        }),
        false // Async = false (We await the result)
      );

      if (execution.status !== "completed") {
        throw new Error(`Function execution failed: ${execution.responseBody}`);
      }

      const response = JSON.parse(execution.responseBody);

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        intentId: response.paymentIntentId,
        clientSecret: response.clientSecret,
        currency: params.currency,
        amount: params.amountCents,
      };
    } catch (error: any) {
      console.error("Payment Service Error:", error);
      throw error;
    }
  },
};
