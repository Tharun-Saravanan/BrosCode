import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services';
import type { CognitoUser, LoginCredentials, SignupData } from '../services';

// User interface compatible with existing components
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string, birthdate: string, gender: string, phoneNumber: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  // Additional Cognito-specific methods
  confirmSignUp: (username: string, confirmationCode: string) => Promise<void>;
  confirmSignUpAndSignIn: (username: string, confirmationCode: string, password: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (username: string, confirmationCode: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Convert CognitoUser to User interface for compatibility
const convertCognitoUser = (cognitoUser: CognitoUser): User => ({
  uid: cognitoUser.username,
  email: cognitoUser.email,
  displayName: cognitoUser.firstName && cognitoUser.lastName
    ? `${cognitoUser.firstName} ${cognitoUser.lastName}`
    : cognitoUser.email,
  firstName: cognitoUser.firstName,
  lastName: cognitoUser.lastName,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setLoading(true);

        // Check if user is already authenticated
        if (AuthService.isAuthenticated()) {
          const cognitoUser = AuthService.getCurrentUser();
          if (cognitoUser) {
            setCurrentUser(convertCognitoUser(cognitoUser));
            console.log('✅ User already authenticated:', cognitoUser.username);
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Clear any invalid tokens
        await AuthService.signOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string, birthdate: string, gender: string, phoneNumber: string) => {
    try {
      setLoading(true);

      // Use email as username for simplicity
      const signupData: SignupData = {
        username: email,
        email,
        password,
        firstName,
        lastName,
        birthdate,
        gender,
        phoneNumber,
      };

      const result = await AuthService.signUp(signupData);
      console.log('✅ Sign up successful, confirmation required:', result.codeDeliveryDetails);

      // Note: User will need to confirm their email before they can sign in
      // The UI should handle this by showing a confirmation code input

    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const credentials: LoginCredentials = {
        username: email, // Using email as username
        password,
      };

      const cognitoUser = await AuthService.signIn(credentials);
      setCurrentUser(convertCognitoUser(cognitoUser));

    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear the user state even if sign out fails
      setCurrentUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Google sign-in would require additional Cognito configuration
    // For now, we'll throw an error to indicate it's not implemented
    throw new Error('Google sign-in not implemented yet. Please use email/password authentication.');
  };

  const confirmSignUp = async (username: string, confirmationCode: string) => {
    try {
      setLoading(true);
      await AuthService.confirmSignUp(username, confirmationCode);
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmSignUpAndSignIn = async (username: string, confirmationCode: string, password: string) => {
    try {
      setLoading(true);

      // First confirm the signup
      await AuthService.confirmSignUp(username, confirmationCode);

      // Then automatically sign in the user
      const credentials: LoginCredentials = {
        username: username,
        password: password,
      };

      const cognitoUser = await AuthService.signIn(credentials);
      setCurrentUser(convertCognitoUser(cognitoUser));

    } catch (error: any) {
      console.error('Confirm sign up and sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (username: string) => {
    try {
      setLoading(true);
      await AuthService.forgotPassword(username);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmForgotPassword = async (username: string, confirmationCode: string, newPassword: string) => {
    try {
      setLoading(true);
      await AuthService.confirmForgotPassword(username, confirmationCode, newPassword);
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    confirmSignUp,
    confirmSignUpAndSignIn,
    forgotPassword,
    confirmForgotPassword,
    isAuthenticated: AuthService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};