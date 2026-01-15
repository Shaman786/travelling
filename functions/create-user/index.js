const sdk = require('node-appwrite');

module.exports = async function (context) {
  const { req, res, log, error } = context;
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
    let body = {};
    if (req.body) {
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (e) {
        error("JSON parse error: " + e.message);
        return res.json({ success: false, error: 'Invalid JSON body' }, 400);
      }
    }

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
    log(`Creating user: ${email} (${name})`);
    
    const user = await users.create(
      userId,
      email,
      phone || undefined,
      password,
      name
    );
    log(`User created in Auth: ${user.$id}`);

    // 2. Create user profile document in database
    try {
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
        log(`User profile created in DB: ${userId}`);
    } catch (dbError) {
        error(`Failed to create DB profile for ${userId}: ${dbError.message}`);
        // Optional: Rollback auth user creation? Or just return error?
        // For now, we'll return error but user exists in Auth.
        return res.json({ success: false, error: 'User created but profile failed: ' + dbError.message }, 500);
    }

    // 3. If role is 'admin', add user to admin team
    if (role === 'admin') {
      try {
        // Check if user is already in team? createMembership throws 409 if so.
        await teams.createMembership(
          ADMIN_TEAM_ID,
          [], // roles within team
          email, // email (for invitation)
          userId, // userId
          undefined, // phone
          undefined, // url (for email verification redirect)
          name
        );
        log(`Added to admin team: ${ADMIN_TEAM_ID}`);
      } catch (teamError) {
        log('Could not add to admin team (might be acceptable): ' + teamError.message);
      }
    }

    return res.json({
      success: true,
      userId: user.$id,
      message: `User ${name} created successfully`,
    });

  } catch (err) {
    error('Create user error: ' + err.message);

    // Handle specific Appwrite errors
    if (err.code === 409) {
      return res.json({
        success: false,
        error: 'A user with this email already exists',
      }, 409);
    }

    return res.json({
      success: false,
      error: err.message || 'Failed to create user',
    }, 500);
  }
};
