// Amazon Cognito Authentication Service for E-commerce Application
import {
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { AWS_CONFIG, cognitoClient } from '../config/aws';
import CryptoJS from 'crypto-js';

// User interface for authentication
export interface CognitoUser {
  username: string;
  email: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
  tokenExpiry: number;
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdate: string; // Format: YYYY-MM-DD
  gender: string; // 'male', 'female', 'other'
  phoneNumber: string; // Format: +1234567890
}

// Generate secret hash for Cognito
const generateSecretHash = (username: string): string => {
  return CryptoJS.HmacSHA256(username + AWS_CONFIG.userPoolClientId, AWS_CONFIG.userPoolClientSecret).toString(CryptoJS.enc.Base64);
};

export class AuthService {
  private static readonly TOKEN_KEY = 'ecommerce_auth_tokens';
  private static readonly USER_KEY = 'ecommerce_current_user';

  /**
   * Sign in user with username and password
   */
  static async signIn(credentials: LoginCredentials): Promise<CognitoUser> {
    try {
      console.log('🔐 Attempting to sign in user:', credentials.username);

      const secretHash = generateSecretHash(credentials.username);

      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: AWS_CONFIG.userPoolClientId,
        AuthParameters: {
          USERNAME: credentials.username,
          PASSWORD: credentials.password,
          SECRET_HASH: secretHash,
        },
      });

      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Authentication failed - no result returned');
      }

      const { AccessToken, IdToken, RefreshToken, ExpiresIn } = response.AuthenticationResult;

      if (!AccessToken || !IdToken || !RefreshToken) {
        throw new Error('Authentication failed - missing tokens');
      }

      // Get user details
      const userInfo = await this.getUserInfo(AccessToken);

      const user: CognitoUser = {
        username: credentials.username,
        email: userInfo.email || '',
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        tokenExpiry: Date.now() + (ExpiresIn || 3600) * 1000,
      };

      // Store tokens securely
      this.storeTokens(user);

      console.log('✅ User signed in successfully');
      return user;
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(signupData: SignupData): Promise<{ userSub: string; codeDeliveryDetails: any }> {
    try {
      console.log('📝 Attempting to sign up user:', signupData.username);

      const secretHash = generateSecretHash(signupData.username);

      const command = new SignUpCommand({
        ClientId: AWS_CONFIG.userPoolClientId,
        Username: signupData.username,
        Password: signupData.password,
        SecretHash: secretHash,
        UserAttributes: [
          {
            Name: 'email',
            Value: signupData.email,
          },
          {
            Name: 'given_name',
            Value: signupData.firstName,
          },
          {
            Name: 'family_name',
            Value: signupData.lastName,
          },
          {
            Name: 'birthdate',
            Value: signupData.birthdate,
          },
          {
            Name: 'gender',
            Value: signupData.gender,
          },
          {
            Name: 'phone_number',
            Value: signupData.phoneNumber,
          },
          {
            Name: 'name',
            Value: `${signupData.firstName} ${signupData.lastName}`,
          },
        ],
      });

      const response = await cognitoClient.send(command);

      console.log('✅ User signed up successfully');
      return {
        userSub: response.UserSub || '',
        codeDeliveryDetails: response.CodeDeliveryDetails,
      };
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }

  /**
   * Confirm sign up with verification code
   */
  static async confirmSignUp(username: string, confirmationCode: string): Promise<void> {
    try {
      console.log('✅ Confirming sign up for user:', username);

      const secretHash = generateSecretHash(username);

      const command = new ConfirmSignUpCommand({
        ClientId: AWS_CONFIG.userPoolClientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        SecretHash: secretHash,
      });

      await cognitoClient.send(command);
      console.log('✅ Sign up confirmed successfully');
    } catch (error: any) {
      console.error('❌ Confirm sign up failed:', error);
      throw new Error(`Confirm sign up failed: ${error.message}`);
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    try {
      const user = this.getCurrentUser();

      if (user?.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: user.accessToken,
        });

        await cognitoClient.send(command);
      }

      // Clear stored tokens
      this.clearTokens();
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      // Clear tokens anyway
      this.clearTokens();
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Check if token is expired
    if (Date.now() >= user.tokenExpiry) {
      this.clearTokens();
      return false;
    }

    return true;
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): CognitoUser | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;

      return JSON.parse(userStr) as CognitoUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user information from access token
   */
  private static async getUserInfo(accessToken: string): Promise<{
    email?: string;
    firstName?: string;
    lastName?: string;
  }> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await cognitoClient.send(command);
      const attributes = response.UserAttributes || [];

      const userInfo: any = {};
      attributes.forEach(attr => {
        switch (attr.Name) {
          case 'email':
            userInfo.email = attr.Value;
            break;
          case 'given_name':
            userInfo.firstName = attr.Value;
            break;
          case 'family_name':
            userInfo.lastName = attr.Value;
            break;
        }
      });

      return userInfo;
    } catch (error) {
      console.error('Error getting user info:', error);
      return {};
    }
  }

  /**
   * Store tokens securely in localStorage
   */
  private static storeTokens(user: CognitoUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        accessToken: user.accessToken,
        idToken: user.idToken,
        refreshToken: user.refreshToken,
        tokenExpiry: user.tokenExpiry,
      }));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  private static clearTokens(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(username: string): Promise<void> {
    try {
      const secretHash = generateSecretHash(username);

      const command = new ForgotPasswordCommand({
        ClientId: AWS_CONFIG.userPoolClientId,
        Username: username,
        SecretHash: secretHash,
      });

      await cognitoClient.send(command);
      console.log('✅ Password reset code sent');
    } catch (error: any) {
      console.error('❌ Forgot password failed:', error);
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  /**
   * Confirm forgot password with new password
   */
  static async confirmForgotPassword(username: string, confirmationCode: string, newPassword: string): Promise<void> {
    try {
      const secretHash = generateSecretHash(username);

      const command = new ConfirmForgotPasswordCommand({
        ClientId: AWS_CONFIG.userPoolClientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
        SecretHash: secretHash,
      });

      await cognitoClient.send(command);
      console.log('✅ Password reset successfully');
    } catch (error: any) {
      console.error('❌ Confirm forgot password failed:', error);
      throw new Error(`Confirm forgot password failed: ${error.message}`);
    }
  }
}
