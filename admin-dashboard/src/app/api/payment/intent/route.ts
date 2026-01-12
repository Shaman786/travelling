import { NextResponse } from "next/server";

// Environment variables
const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const API_KEY = process.env.AIRWALLEX_API_KEY;
const API_URL =
  process.env.AIRWALLEX_API_URL || "https://api-demo.airwallex.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, customerId, orderId } = body;

    if (!CLIENT_ID || !API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: Missing Airwallex keys" },
        { status: 500 },
      );
    }

    // 1. Authenticate to get Bearer Token
    const authResponse = await fetch(`${API_URL}/api/v1/authentication/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CLIENT_ID,
        "x-api-key": API_KEY,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("Airwallex Auth Error:", errorText);
      return NextResponse.json(
        { error: "Failed to authenticate with Payment Provider" },
        { status: 502 },
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // 2. Create Payment Intent
    const intentPayload = {
      request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: amount,
      currency: currency,
      merchant_order_id: orderId,
      return_url: "travelling://payment-result", // Deep link to app
      customer_id: customerId,
      descriptor: "Travelling App Booking",
      metadata: {
        orderId: orderId,
      },
    };

    const intentResponse = await fetch(
      `${API_URL}/api/v1/pa/payment_intents/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(intentPayload),
      },
    );

    if (!intentResponse.ok) {
      const errorText = await intentResponse.text();
      console.error("Airwallex Intent Error:", errorText);
      return NextResponse.json(
        { error: "Failed to create payment intent", details: errorText },
        { status: 502 },
      );
    }

    const intentData = await intentResponse.json();

    return NextResponse.json({
      intentId: intentData.id,
      clientSecret: intentData.client_secret,
      currency: intentData.currency,
      amount: intentData.amount,
    });
  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
