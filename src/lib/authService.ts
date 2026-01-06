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
import { account, COLLECTIONS, DATABASE_ID, databases, ID } from "./appwrite";

// ============ Auth Service ============

export const authService = {
  /**
   * Create a new user account with email and password
   */
  async register(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      // Create the account
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      // Automatically log in after registration
      await account.createEmailPasswordSession(email, password);
      
      // Create user profile in database
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        newAccount.$id,
        {
          name,
          email,
          createdAt: new Date().toISOString(),
        }
      );
      
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
    try {
      await account.createEmailPasswordSession(email, password);
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
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
      return profile as unknown as User;
    } catch {
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        updates
      );
      return updated as unknown as User;
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
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
      await account.createRecovery(
        email,
        "travelling://reset-password" // Deep link URL
      );
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
    newPassword: string
  ): Promise<void> {
    try {
      await account.updateRecovery(userId, secret, newPassword);
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
      await account.updateName(name);
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
      await account.updateEmail(email, password);
    } catch (error: any) {
      console.error("Update email error:", error);
      throw new Error(error.message || "Failed to update email");
    }
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await account.updatePassword(newPassword, oldPassword);
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
      // Note: This requires special permissions in Appwrite
      await account.updateStatus();
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
};

export default authService;
