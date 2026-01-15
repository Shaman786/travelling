/**
 * useAuth Hook
 *
 * React hook for authentication state and actions.
 * Provides login, signup, logout, and user state management.
 */

import { useCallback, useEffect, useState } from "react";
import { authService } from "../lib/authService";
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "../lib/notifications";
import { User, useStore } from "../store/useStore";

interface UseAuthReturn {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  loginWithProvider: (provider: "google" | "apple") => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // NEW: Track initial session check
  const [error, setError] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setUser = useStore((state) => state.setUser);
  const storeLogout = useStore((state) => state.logout);

  const checkSession = useCallback(async () => {
    try {
      const authUser = await authService.getCurrentUser();
      if (authUser) {
        // Get full profile from database
        const profile = await authService.getUserProfile(authUser.$id);
        if (profile) {
          setUser(profile);
        } else {
          // Create basic user object from auth data
          setUser({
            $id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            createdAt: new Date().toISOString(),
          });
        }

        // Register for push notifications
        registerForPushNotificationsAsync().then((token) => {
          if (token) savePushToken(token, authUser.$id);
        });
      } else {
        // No user returned, clear local state
        storeLogout();
      }
    } catch {
      // No active session on backend, so clear local state to be safe
      storeLogout();
    } finally {
      setIsInitializing(false); // Session check complete
    }
  }, [storeLogout, setUser]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const authUser = await authService.login(email, password);

        // Get full profile
        const profile = await authService.getUserProfile(authUser.$id);

        setUser(
          profile || {
            $id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            createdAt: new Date().toISOString(),
          }
        );

        // Register for push notifications
        registerForPushNotificationsAsync().then((token) => {
          if (token) savePushToken(token, authUser.$id);
        });

        return true;
      } catch (err: any) {
        setError(err.message || "Login failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const authUser = await authService.register(email, password, name);

        // Fetch full profile to ensure all data is available
        const profile = await authService.getUserProfile(authUser.$id);

        // Update local state - Auto login handled by authService.register
        setUser(
          profile || {
            $id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            createdAt: new Date().toISOString(),
          }
        );

        // Register for push notifications
        registerForPushNotificationsAsync().then((token) => {
          if (token) savePushToken(token, authUser.$id);
        });

        return true;
      } catch (err: any) {
        setError(err.message || "Registration failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      storeLogout();
    } catch (err: any) {
      console.error("Logout error:", err);
      // Still clear local state even if API fails
      storeLogout();
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const loginWithProvider = useCallback(
    async (provider: "google" | "apple") => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.initiateOAuth2Login(provider);
        // Note: Actual session update happens after redirect and deep link handling
        // We don't await the redirect here, as it opens a browser
      } catch (err: any) {
        setError(err.message || "OAuth initiation failed");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    user,
    isLoggedIn,
    isLoading: isLoading || isInitializing, // Include initial check in loading state
    error,
    login,
    signup,
    logout,
    clearError,
    refreshUser,
    loginWithProvider,
  };
}

export default useAuth;
