/**
 * Appwrite Cloud Function: Create User
 * 
 * This function creates a new user with authentication credentials.
 * It should be deployed to Appwrite Cloud Functions.
 * 
 * Environment Variables Required:
 * - APPWRITE_FUNCTION_PROJECT_ID
 * - APPWRITE_FUNCTION_API_KEY
 * - DATABASE_ID (optional, defaults to 'travelling_db')
 * - ADMIN_TEAM_ID (optional, for admin role assignment)
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123",
 *   "name": "John Doe",
 *   "phone": "+1234567890", // optional
 *   "role": "user" | "admin"
 * }
 * 
 * Deploy with:
 *   appwrite deploy function --function-id create-user
 */

const sdk = require('node-appwrite');

module.exports = async function (req, res) {
  const client = new sdk.Client();
  const users = new sdk.Users(client);
  const databases = new sdk.Databases(client);
  const teams = new sdk.Teams(client);

  // Initialize client with server credentials
  client
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const DATABASE_ID = process.env.DATABASE_ID || 'travelling_db';
  const ADMIN_TEAM_ID = process.env.ADMIN_TEAM_ID || 'admin';

  try {
    // Parse request body
    const body = JSON.parse(req.body || '{}');
    const { email, password, name, phone, role = 'user' } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.json({
        success: false,
        error: 'Missing required fields: email, password, name',
      }, 400);
    }

    // Validate password length
    if (password.length < 8) {
      return res.json({
        success: false,
        error: 'Password must be at least 8 characters',
      }, 400);
    }

    // 1. Create user in Appwrite Auth
    const userId = sdk.ID.unique();
    const user = await users.create(
      userId,
      email,
      phone || undefined,
      password,
      name
    );

    // 2. Create user profile document in database
    await databases.createDocument(
      DATABASE_ID,
      'users',
      userId,
      {
        name,
        email,
        phone: phone || '',
        role,
        onboardingComplete: false,
      }
    );

    // 3. If role is 'admin', add user to admin team
    if (role === 'admin') {
      try {
        await teams.createMembership(
          ADMIN_TEAM_ID,
          [], // roles within team
          email, // email (for invitation)
          userId, // userId
          undefined, // phone
          undefined, // url (for email verification redirect)
          name
        );
      } catch (teamError) {
        console.log('Could not add to admin team:', teamError.message);
        // Continue - user is created, team membership is optional
      }
    }

    return res.json({
      success: true,
      userId: user.$id,
      message: `User ${name} created successfully`,
    });

  } catch (error) {
    console.error('Create user error:', error);

    // Handle specific Appwrite errors
    if (error.code === 409) {
      return res.json({
        success: false,
        error: 'A user with this email already exists',
      }, 409);
    }

    return res.json({
      success: false,
      error: error.message || 'Failed to create user',
    }, 500);
  }
};
