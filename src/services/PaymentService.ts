import { functions, FUNCTIONS } from "../lib/appwrite";

export const paymentService = {
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerId?: string;
    userId?: string;
  }) {
    try {
      console.log(`Creating Payment Intent via Appwrite Function...`);

      // Amount is expected in CENTS by the function (based on legacy code amount/100)
      // If frontend passes dollars (e.g. 150), we send 15000 cents.
      // Wait, backend code does: amount = amount / 100.
      // So if we send 15000 cents, it becomes 150.00.
      // If we send 150 dollars, it becomes 1.50.
      // Airwallex expects Major units (Dollars) usually?
      // Docs say: "amount: Order amount. For example, 3.50".
      // So backend logic "amount / 100" means it expects CENTS as input.
      // So we multiply by 100 here.
      const centsAmount = Math.round(params.amount * 100);

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
        amount: params.amount,
      };
    } catch (error: any) {
      console.error("Payment Service Error:", error);
      throw error;
    }
  },
};
