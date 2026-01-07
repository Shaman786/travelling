/**
 * useAuth Hook
 * 
 * React hook for authentication state and actions.
 * Provides login, signup, logout, and user state management.
 */

import { useCallback, useEffect, useState } from "react";
import { authService } from "../lib/authService";
import { registerForPushNotificationsAsync, savePushToken } from "../lib/notifications";
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
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useStore((state) => state.user);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setUser = useStore((state) => state.setUser);
  const storeLogout = useStore((state) => state.logout);

  // Check for existing session on mount


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
        registerForPushNotificationsAsync().then(token => {
          if (token) savePushToken(token, authUser.$id);
        });
      }
    } catch {
      // No active session, that's fine
    }
  }, [setUser]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authUser = await authService.login(email, password);
      
      // Get full profile
      const profile = await authService.getUserProfile(authUser.$id);
      
      setUser(profile || {
        $id: authUser.$id,
        name: authUser.name,
        email: authUser.email,
        createdAt: new Date().toISOString(),
      });
      
      // Register for push notifications
      registerForPushNotificationsAsync().then(token => {
        if (token) savePushToken(token, authUser.$id);
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const signup = useCallback(async (
    email: string, 
    password: string, 
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authUser = await authService.register(email, password, name);
      
      setUser({
        $id: authUser.$id,
        name: authUser.name,
        email: authUser.email,
        createdAt: new Date().toISOString(),
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

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

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    refreshUser,
  };
}

export default useAuth;
