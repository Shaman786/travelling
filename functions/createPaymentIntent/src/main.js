const https = require('https');

/**
 * Create PaymentIntent with Airwallex
 * 
 * This function securely creates a PaymentIntent using Airwallex API.
 * It should be called from the mobile app before presenting the payment UI.
 * 
 * Required Environment Variables:
 * - AIRWALLEX_API_KEY
 * - AIRWALLEX_CLIENT_ID
 * - AIRWALLEX_ENVIRONMENT (demo | production)
 */

function makeRequest(hostname, path, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, ...options },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

module.exports = async function (context) {
  const { req, res, log, error } = context;

  // Parse request body
  let body;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  const { amount, currency, bookingId, userId } = body;

  if (!amount || !currency) {
    return res.json({ error: 'Missing required fields: amount, currency' }, 400);
  }

  const API_KEY = process.env.AIRWALLEX_API_KEY;
  const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
  const ENV = process.env.AIRWALLEX_ENVIRONMENT || 'demo';
  const BASE_HOST = ENV === 'production' 
    ? 'api.airwallex.com' 
    : 'api-demo.airwallex.com';

  if (!API_KEY || !CLIENT_ID) {
    error('Missing Airwallex credentials');
    return res.json({ error: 'Server configuration error' }, 500);
  }

  try {
    // Step 1: Authenticate with Airwallex
    log('Authenticating with Airwallex...');
    const authData = await makeRequest(
      BASE_HOST,
      '/api/v1/authentication/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CLIENT_ID,
          'x-api-key': API_KEY,
        },
      }
    );

    if (!authData.token) {
      error('Auth failed: ' + JSON.stringify(authData));
      return res.json({ error: 'Authentication failed' }, 500);
    }

    // Step 2: Create PaymentIntent
    log('Creating PaymentIntent...');
    const intentPayload = JSON.stringify({
      amount: amount / 100, // Convert cents to dollars
      currency: currency.toUpperCase(),
      merchant_order_id: bookingId || `order_${Date.now()}`,
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userId: userId || 'anonymous',
        bookingId: bookingId || '',
        source: 'travelling-app',
      },
    });

    const intentData = await makeRequest(
      BASE_HOST,
      '/api/v1/pa/payment_intents/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.token}`,
        },
      },
      intentPayload
    );

    if (!intentData.id || !intentData.client_secret) {
      error('PaymentIntent creation failed: ' + JSON.stringify(intentData));
      return res.json({ error: 'Failed to create payment intent' }, 500);
    }

    log(`PaymentIntent created: ${intentData.id}`);

    return res.json({
      paymentIntentId: intentData.id,
      clientSecret: intentData.client_secret,
    });
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: 'Internal server error' }, 500);
  }
};
