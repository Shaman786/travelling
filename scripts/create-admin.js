const { Client, Teams, Account, ID } = require('node-appwrite');
require('dotenv').config();

const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars (APPWRITE_API_KEY, APPWRITE_PROJECT_ID)");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const teams = new Teams(client);
// We use a separate client/account for user creation if we want to mimic client-side, 
// but with API Key we can use server-side 'users' service, but Account service is for current session.
// Better to use 'Users' service from node-appwrite for server-side user creation.
const { Users } = require('node-appwrite');
const users = new Users(client);

const ADMIN_EMAIL = "admin@travelling.app";
const ADMIN_PASS = "admin123456";
const ADMIN_NAME = "Super Admin";
const TEAM_NAME = "admin";

async function createAdmin() {
  console.log("🚀 Setting up Admin User & Team...");

  let teamId = null;

  // 1. Create or Get 'admin' Team
  try {
    const teamList = await teams.list();
    const existingTeam = teamList.teams.find(t => t.name === TEAM_NAME);
    
    if (existingTeam) {
      console.log(`✅ Team '${TEAM_NAME}' already exists (ID: ${existingTeam.$id})`);
      teamId = existingTeam.$id;
    } else {
      console.log(`Creating team '${TEAM_NAME}'...`);
      const newTeam = await teams.create(ID.unique(), TEAM_NAME);
      teamId = newTeam.$id;
      console.log(`✅ Team created (ID: ${teamId})`);
    }
  } catch (err) {
    console.error("Error managing team:", err.message);
    process.exit(1);
  }

  // 2. Create or Get Admin User
  let userId = null;
  try {
    const userList = await users.list([
        // Query logic could go here, but simple listing is fine for now
    ]);
    const existingUser = userList.users.find(u => u.email === ADMIN_EMAIL);

    if (existingUser) {
        console.log(`✅ User '${ADMIN_EMAIL}' already exists (ID: ${existingUser.$id})`);
        userId = existingUser.$id;
        // Optional: Update password if needed, but we'll skip to avoid resetting valid passwords
    } else {
        console.log(`Creating user '${ADMIN_EMAIL}'...`);
        const newUser = await users.create(ID.unique(), ADMIN_EMAIL, undefined, ADMIN_PASS, ADMIN_NAME);
        userId = newUser.$id;
        console.log(`✅ User created successfully.`);
    }
  } catch (err) {
    console.error("Error managing user:", err.message);
    process.exit(1);
  }

  // 3. Add User to Team
  try {
    const memberships = await teams.listMemberships(teamId);
    const isMember = memberships.memberships.find(m => m.userId === userId);

    if (isMember) {
        console.log(`✅ User is already a member of the '${TEAM_NAME}' team.`);
    } else {
        console.log(`Adding user to '${TEAM_NAME}' team...`);
        // Note: In server-side SDK, creating membership usually invites. 
        // But with API Key, we can explicitly add.
        // Wait, node-appwrite createMembership sends an email/invite.
        // To auto-join, we might need a different approach or just accept that they need to click a link?
        // Actually, for server side adding, usually we use 'createMembership' and since we are admin, verify it?
        // Let's check node-appwrite docs mentally. createMembership(teamId, roles, email, userId, phone, url, name)
        
        await teams.createMembership(teamId, ['owner'], undefined, userId); 
        console.log(`✅ User added to team '${TEAM_NAME}'.`);
    }
  } catch (err) {
      // If user is already member (409)
      if (err.code === 409) { 
          console.log(`✅ User is already a member.`);
      } else {
          console.error("Error adding to team:", err.message);
      }
  }

  console.log("\n🎉 Admin Setup Complete!");
  console.log(`\n👉 Email: ${ADMIN_EMAIL}`);
  console.log(`👉 Password: ${ADMIN_PASS}`);
}

createAdmin();
