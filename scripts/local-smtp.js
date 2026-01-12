const SMTPServer = require("smtp-server").SMTPServer;
const simpleParser = require("mailparser").simpleParser;

/**
 * Local SMTP Server for Testing Appwrite Emails
 * 
 * Usage:
 * 1. Install dependencies: `npm install smtp-server mailparser`
 * 2. Run: `node scripts/local-smtp.js`
 * 3. Configure Appwrite (Self-Hosted):
 *    - _APP_SMTP_HOST=host.docker.internal (or your PC's IP)
 *    - _APP_SMTP_PORT=2525
 *    - _APP_SMTP_SECURE=false
 */

const server = new SMTPServer({
  logger: false,
  authOptional: true, // Allow Appwrite to connect without auth
  
  // Accept any username/password if authentication is attempted
  onAuth(auth, session, callback) {
    return callback(null, { user: "test-user" });
  },

  onData(stream, session, callback) {
    simpleParser(stream, (err, parsed) => {
      if (err) {
        console.error("Error parsing email:", err);
        return callback(err);
      }
      
      console.log("\n==================================================");
      console.log("📧 NEW EMAIL RECEIVED");
      console.log("==================================================");
      console.log("From:    ", parsed.from.text);
      console.log("To:      ", parsed.to.text);
      console.log("Subject: ", parsed.subject);
      console.log("--------------------------------------------------");
      
      // Try to find the Magic Link in text
      const textContent = parsed.text || "";
      
      // Regex to find the magic link (assuming it starts with the app scheme or http)
      // The user's magic link looks like: travelling://login-callback?userId=...&secret=...
      // Or http://localhost/v1/account... if redirected
      
      // Just print everything so user can copy-paste
      console.log("Link content detected:");
      console.log(textContent);
      
      // Attempt to extract the deep link explicitly if possible
      const deepLinkMatch = textContent.match(/travelling:\/\/login-callback[^\s"']+/);
      if (deepLinkMatch) {
         console.log("\n🔗 MAGIC LINK FOUND (COPY THIS):");
         console.log(deepLinkMatch[0]);
      } else {
         // Maybe it's an HTTP link that redirects to the custom scheme
         const httpLinkMatch = textContent.match(/https?:\/\/[^\s"']+/);
         if (httpLinkMatch) {
            console.log("\n🔗 LINK FOUND (Might be Magic Link):");
            console.log(httpLinkMatch[0]);
         }
      }

      console.log("==================================================\n");
      
      callback();
    });
  }
});

const PORT = 2525;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Local SMTP Server running on port ${PORT}`);
    console.log("Ready to receive emails from Appwrite...");
});
