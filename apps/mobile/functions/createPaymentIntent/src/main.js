const https = require('https');

/**
 * Helper to make HTTPS requests
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
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(parsed.message || JSON.stringify(parsed)));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            console.error('JSON Parse Error Response:', data);
            if (res.statusCode >= 400) {
              reject(new Error(data || 'Unknown error'));
            } else {
              resolve(data);
            }
          }
        });
      }
    );
    req.on('error', (e) => reject(e));
    if (body) req.write(body);
    req.end();
  });
}

module.exports = async function (context) {
  // Appwrite 1.4+ Context Destructuring
  const { req, res, log, error } = context;

  log('--------------------------------------------------');
  log('🚀 Function Started: createPaymentIntent');
  
  // 1. Env Check
  const API_KEY = process.env.AIRWALLEX_API_KEY;
  const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
  const ENV = process.env.AIRWALLEX_ENVIRONMENT || 'demo';
  
  log(`Environment: ${ENV}`);
  if (!API_KEY || !CLIENT_ID) {
    error('❌ MISSING CREDENTIALS: AIRWALLEX_API_KEY or AIRWALLEX_CLIENT_ID not found.');
    // Check if they are global but not redeployed?
    return res.json({ 
      error: 'Server Misconfiguration: Missing Airwallex Credentials',
      tip: 'Ensure variables are set in Function Settings and REDEPLOY.'
    }, 500);
  } else {
    log('✅ Credentials found.');
  }

  // 2. Body Parsing
  let payload = {};
  try {
    if (typeof req.body === 'string') {
        payload = JSON.parse(req.body);
    } else {
        payload = req.body || {};
    }
  } catch (e) {
    error('❌ Invalid JSON Body');
    return res.json({ error: 'Invalid JSON request body' }, 400);
  }

  log('Payload:', JSON.stringify(payload));
  const { amount, currency, bookingId, userId } = payload;

  if (!amount || !currency) {
    error('❌ Missing fields: amount or currency');
    return res.json({ error: 'Missing required fields: amount (cents), currency' }, 400);
  }

  const BASE_HOST = ENV === 'production' ? 'api.airwallex.com' : 'api-demo.airwallex.com';

  try {
    // 3. Authenticate
    log('🔐 Authenticating with Airwallex...');
    const authData = await makeRequest(
      BASE_HOST,
      '/api/v1/authentication/login',
      {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': CLIENT_ID,
            'x-api-key': API_KEY
        }
      }
    );
    
    log('✅ Authenticated. Getting Token...');
    const token = authData.token;

    // 4. Create Intent
    log(`💰 Creating Intent for Amount: ${amount} ${currency.toUpperCase()}`);
    
    // Amount should be passed in CENTS (or minor units) logic depends on PaymentService
    // PaymentService sends CENTS (e.g. 1000 for $10.00).
    // Airwallex "amount" field expects DECIMAL (e.g. 10.00).
    // So we must DIVIDE by 100 here.
    const decimalAmount = (parseFloat(amount) / 100).toFixed(2);
    
    const intentPayload = JSON.stringify({
      amount: parseFloat(decimalAmount),
      currency: currency.toUpperCase(),
      merchant_order_id: bookingId || `order_${Date.now()}`,
      request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      return_url: "travelling://payment-result",
      metadata: {
         userId: userId || 'anonymous'
      }
    });

    log(`Intent Payload: ${intentPayload}`);

    const intentData = await makeRequest(
      BASE_HOST,
      '/api/v1/pa/payment_intents/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      },
      intentPayload
    );

    log(`✅ SUCCESS! Intent ID: ${intentData.id}`);

    return res.json({
      paymentIntentId: intentData.id,
      clientSecret: intentData.client_secret,
      currency: intentData.currency,
      amount: intentData.amount
    });

  } catch (err) {
    error(`❌ ERROR: ${err.message}`);
    return res.json({ 
        error: 'Payment Provider Error', 
        details: err.message 
    }, 502);
  }
};
