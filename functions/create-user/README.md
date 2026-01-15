# Create User Cloud Function

This Appwrite Cloud Function creates users with proper authentication credentials.

## Purpose

The Admin Dashboard cannot create users with login credentials from the Client SDK while logged in. This Cloud Function solves that by using the Server SDK with elevated permissions.

## Deployment

### 1. Install Appwrite CLI

```bash
npm install -g appwrite-cli
appwrite login
```

### 2. Create the Function in Appwrite Console

1. Go to your Appwrite Console → Functions
2. Click "Create Function"
3. Name: `create-user`
4. Runtime: `Node.js 18.0` or later
5. Entry point: `index.js`

### 3. Set Environment Variables

In the Function settings, add:

- `APPWRITE_FUNCTION_API_ENDPOINT`: Your Appwrite endpoint
- `APPWRITE_FUNCTION_PROJECT_ID`: Your project ID
- `APPWRITE_FUNCTION_API_KEY`: A server API key with Users.read/write and Teams.read/write permissions
- `DATABASE_ID`: `travelling_db`
- `ADMIN_TEAM_ID`: Your admin team ID (e.g., `695f5c530000d10e3388`)

### 4. Deploy

```bash
cd functions/create-user
appwrite deploy function
```

Or upload as a tarball:

```bash
npm install
tar -czvf create-user.tar.gz .
# Upload via Console
```

## Usage

### From Admin Dashboard

Update `CreateUserModal.tsx` to call this function:

```typescript
import { functions } from "@/lib/appwrite";

const response = await functions.createExecution(
  "create-user", // Function ID
  JSON.stringify({
    email,
    password,
    name,
    role, // 'user' or 'admin'
  }),
  false // Wait for response
);

const result = JSON.parse(response.responseBody);
if (result.success) {
  // User created successfully
} else {
  throw new Error(result.error);
}
```

## Request Format

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "user"
}
```

## Response Format

### Success

```json
{
  "success": true,
  "userId": "abc123",
  "message": "User John Doe created successfully"
}
```

### Error

```json
{
  "success": false,
  "error": "A user with this email already exists"
}
```
