# Create Payment Intent

Appwrite Function for creating Airwallex PaymentIntents.

## Environment Variables

Set these in Appwrite Console → Functions → createPaymentIntent → Settings → Variables:

| Variable                | Description              |
| ----------------------- | ------------------------ |
| `AIRWALLEX_API_KEY`     | Your Airwallex API Key   |
| `AIRWALLEX_CLIENT_ID`   | Your Airwallex Client ID |
| `AIRWALLEX_ENVIRONMENT` | `demo` or `production`   |

## Request

```json
{
  "amount": 15000, // Amount in cents (e.g., $150.00)
  "currency": "USD", // Currency code
  "bookingId": "abc123", // Optional: booking reference
  "userId": "user_123" // Optional: user ID
}
```

## Response

```json
{
  "paymentIntentId": "int_xxx",
  "clientSecret": "cs_xxx"
}
```
