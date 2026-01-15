# Setting up Local SMTP for Appwrite Magic Links

Since you are using a self-hosted Appwrite instance, you can use a local SMTP server to capture the "Magic Link" emails without needing a real email provider (like SendGrid).

## 1. Setup the Local SMTP Server

We have created a script at `scripts/local-smtp.js`.

1. **Install Dependencies** (You can do this in a separate temporary folder if you don't want to pollute the project, or just in the root):

   ```bash
   npm install smtp-server mailparser
   ```

2. **Run the Server**:
   ```bash
   node scripts/local-smtp.js
   ```
   It will start listening on port **2525**.

## 2. Configure Your Self-Hosted Appwrite

You need to tell your running Appwrite container to send emails to your computer's port 2525.

1. Open your Appwrite `docker-compose.yml` or `.env` file.
2. Update the following environment variables:

   ```env
   _APP_SMTP_HOST=host.docker.internal
   _APP_SMTP_PORT=2525
   _APP_SMTP_SECURE=false
   _APP_SMTP_USERNAME=
   _APP_SMTP_PASSWORD=
   ```

   **Note on Credentials:**  
   You can leave `_APP_SMTP_USERNAME` and `_APP_SMTP_PASSWORD` **empty**.  
   Our local script is configured to accept _any_ credentials, so if you prefer, you can set them to "test"/"test", but it's not required.

   > **Note:** `host.docker.internal` allows the Docker container to talk to your host machine (Windows). if that doesn't work, try using your actual LAN IP address (e.g., `192.168.1.x`).

3. **Restart Appwrite**:
   ```bash
   docker-compose up -d
   ```

## 3. Test the Workflow

1. Run the `travelling` app (`npx expo start`).
2. Go to the **Login** screen.
3. Enter an email (e.g., `test@example.com`) and tap **"Send Magic Link"**.
4. Watch the `node scripts/local-smtp.js` terminal window.
5. You should see the email arrive. **Copy the `travelling://...` link** printed in the console.
6. Open that link in your emulator/device (or just click it if supported) to complete the login.
