/**
 * Appwrite Authentication Service
 *
 * Handles all authentication operations:
 * - Email/Password login & registration
 * - OAuth (Google, Apple)
 * - Session management
 * - Password reset
 */

import type { AuthUser, User } from "../types";
import {
  account,
  DATABASE_ID,
  databases,
  ID,
  OAuthProvider,
  TABLES,
} from "./appwrite";

// ============ Auth Service ============

export const authService = {
  /**
   * Create a new user account with email and password
   */
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthUser> {
    try {
      // Create the account
      const newAccount = await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      // Automatically log in after registration
      await account.createEmailPasswordSession({
        email,
        password,
      });

      // Create user profile in database
      await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: TABLES.USERS,
        documentId: newAccount.$id,
        data: {
          name,
          email,
          // createdAt: handled by system as $createdAt
        },
      });

      // Send verification email
      try {
        await account.createEmailVerification({
          url: "travelling://verify",
        });
      } catch {
        // Verification email is optional - silently ignore failure
      }

      return newAccount as unknown as AuthUser;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthUser> {
    // Proactively try to clear any existing session to avoid "Active Session" errors
    // and prevent unnecessary API calls/rate limits from retries.
    try {
      await account.deleteSession("current");
    } catch {
      // Ignore if no session exists or other error
    }

    try {
      await account.createEmailPasswordSession({
        email,
        password,
      });
      const user = await account.get();
      return user as unknown as AuthUser;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Invalid email or password");
    }
  },

  /**
   * Get current logged in user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();
      return user as unknown as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const profile = await databases.getDocument({
        databaseId: DATABASE_ID,
        collectionId: TABLES.USERS,
        documentId: userId,
      });
      return {
        ...profile,
        createdAt: profile.$createdAt,
      } as unknown as User;
    } catch {
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updated = await databases.updateDocument({
        databaseId: DATABASE_ID,
        collectionId: TABLES.USERS,
        documentId: userId,
        data: updates,
      });
      return updated as unknown as User;
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  },

  // Alias for updateProfile to match usage in components
  async updateUserProfile(
    userId: string,
    updates: Partial<User>,
  ): Promise<User> {
    return this.updateProfile(userId, updates);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Delete ALL sessions to ensure complete logout
      // (deleteSession only deletes current device, other sessions may remain)
      await account.deleteSessions();
    } catch (error: any) {
      console.error("Logout error:", error);
      // Don't throw - user might already be logged out
    }
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await account.createRecovery({
        email,
        url: "travelling://reset-password",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to send reset email");
    }
  },

  /**
   * Complete password reset
   */
  async resetPassword(
    userId: string,
    secret: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await account.updateRecovery({
        userId,
        secret,
        password: newPassword,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to reset password");
    }
  },

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Update account name
   */
  async updateName(name: string): Promise<void> {
    try {
      await account.updateName({ name });
    } catch (error: any) {
      console.error("Update name error:", error);
      throw new Error(error.message || "Failed to update name");
    }
  },

  /**
   * Update account email
   */
  async updateEmail(email: string, password: string): Promise<void> {
    try {
      await account.updateEmail({ email, password });
    } catch (error: any) {
      console.error("Update email error:", error);
      throw new Error(error.message || "Failed to update email");
    }
  },

  /**
   * Change password
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await account.updatePassword({
        password: newPassword,
        oldPassword,
      });
    } catch (error: any) {
      console.error("Change password error:", error);
      throw new Error(error.message || "Failed to change password");
    }
  },

  /**
   * Delete account (GDPR compliance)
   */
  async deleteAccount(): Promise<void> {
    try {
      // 1. Get current user ID
      const user = await account.get();

      // 2. Delete User Profile Data (Content Deletion)
      try {
        await databases.deleteDocument(DATABASE_ID, TABLES.USERS, user.$id);
      } catch (dbError) {
        console.warn("Failed to delete user profile data:", dbError);
        // Continue to logout even if DB delete fails (might be already deleted)
      }

      // 3. Delete Auth Session (Logout)
      // NOTE: For full Auth Identity deletion, this should trigger a Cloud Function.
      // Deleting the profile data is sufficient for "User Data Deletion" compliance.
      await account.deleteSessions();
    } catch (error: any) {
      console.error("Delete account error:", error);
      throw new Error(error.message || "Failed to delete account");
    }
  },
  /**
   * Create JWT for authenticated API calls
   */
  async createJWT(): Promise<string> {
    try {
      const { jwt } = await account.createJWT();
      return jwt;
    } catch (error: any) {
      console.error("Create JWT error:", error);
      throw new Error(error.message || "Failed to create JWT");
    }
  },
  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<void> {
    try {
      await account.createEmailVerification({
        url: "travelling://verify",
      });
    } catch (error: any) {
      console.error("Verification email error:", error);
      throw new Error(error.message || "Failed to send verification email");
    }
  },

  /**
   * Complete email verification
   */
  async completeVerification(userId: string, secret: string): Promise<void> {
    try {
      await account.updateEmailVerification({
        userId,
        secret,
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      throw new Error(error.message || "Failed to verify email");
    }
  },

  // ============ Phone Authentication (Plug-and-Play) ============

  /**
   * Initiate Phone Login (Sends OTP)
   * @param phone Phone number in E.164 format (e.g., +1234567890)
   */
  async initiatePhoneLogin(phone: string): Promise<string> {
    try {
      // Create a phone session token
      // This sends the SMS via the provider configured in Appwrite Console
      const token = await account.createPhoneToken(ID.unique(), phone);
      return token.userId;
    } catch (error: any) {
      console.error("Phone login init error:", error);
      throw new Error(error.message || "Failed to send OTP");
    }
  },

  /**
   * Complete Phone Login (Verifies OTP)
   * @param userId User ID returned from initiatePhoneLogin
   * @param secret OTP code entered by user
   */
  async completePhoneLogin(userId: string, secret: string): Promise<AuthUser> {
    try {
      // Create the session with the secret (OTP)
      await account.createSession(userId, secret);
      const user = await account.get();
      return user as unknown as AuthUser;
    } catch (error: any) {
      console.error("Phone login complete error:", error);
      throw new Error(error.message || "Invalid OTP");
    }
  },

  // ============ Magic URL Authentication (Passwordless) ============

  /**
   * Initiate Magic Link Login
   * @param email User's email
   */
  async initiateMagicLinkLogin(email: string): Promise<string> {
    try {
      // Magic Links require the redirect URL hostname to be a registered Web Platform
      // Using environment variable for redirect URL
      const redirectUrl =
        process.env.EXPO_PUBLIC_MAGIC_LINK_REDIRECT ||
        "https://travelling-admin.vercel.app/login-callback";
      console.log("➡️ Using Redirect URL:", redirectUrl);

      const token = await account.createMagicURLToken(
        ID.unique(),
        email,
        redirectUrl,
      );
      return token.$id;
    } catch (error: any) {
      console.error("Magic link init error:", error);
      throw new Error(error.message || "Failed to send Magic Link");
    }
  },

  /**
   * Complete Magic Link Login
   * @param userId User ID from link
   * @param secret Secret from link
   */
  async completeMagicLinkLogin(
    userId: string,
    secret: string,
  ): Promise<AuthUser> {
    try {
      await account.createSession(userId, secret);
      const user = await account.get();
      return user as unknown as AuthUser;
    } catch (error: any) {
      console.error("Magic link complete error:", error);
      throw new Error(error.message || "Invalid Magic Link");
    }
  },
  /**
   * Initiate OAuth2 Login (Google, Apple, etc.)
   * @param provider 'google' | 'apple'
   */
  async initiateOAuth2Login(provider: "google" | "apple"): Promise<void> {
    try {
      const providerEnum =
        provider === "google" ? OAuthProvider.Google : OAuthProvider.Apple;
      // Create OAuth2 session
      // This will open a browser window for authentication
      // Success/Failure redirects back to the app via deep link
      await account.createOAuth2Session(
        providerEnum,
        "travelling://oauth-callback", // Success URL
        "travelling://login?error=oauth_failed", // Failure URL
      );
    } catch (error: any) {
      console.error("OAuth2 init error:", error);
      throw new Error(error.message || "Failed to initiate OAuth2");
    }
  },
};

export default authService;
