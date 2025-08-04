import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { stytchAuthService } from '../services/auth/stytchAuthService';

// User interface
export interface User {
  user_id: string;
  email_addresses: Array<{
    email_address: string;
    verified: boolean;
  }>;
  name?: {
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  updated_at: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (updates: { name?: { first_name?: string; last_name?: string } }) => Promise<User | null>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await stytchAuthService.initialize();
        
        if (stytchAuthService.isAuthenticated()) {
          const currentUser = await stytchAuthService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await stytchAuthService.authenticateWithEmail(email, password);
      if (success) {
        const currentUser = await stytchAuthService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Register function
  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await stytchAuthService.registerWithEmail(email, password);
      if (success) {
        const currentUser = await stytchAuthService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      return success;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await stytchAuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      return await stytchAuthService.resetPassword(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  // Reset password with token function
  const resetPasswordWithToken = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const success = await stytchAuthService.resetPasswordWithToken(token, newPassword);
      if (success) {
        const currentUser = await stytchAuthService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      return success;
    } catch (error) {
      console.error('Password reset with token failed:', error);
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (updates: { name?: { first_name?: string; last_name?: string } }): Promise<User | null> => {
    try {
      const updatedUser = await stytchAuthService.updateUserProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    resetPasswordWithToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 