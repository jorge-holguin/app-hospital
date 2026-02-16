/**
 * Session persistence utility using AsyncStorage.
 * Stores accessToken + refreshToken from the auth API.
 *
 * Usage:
 *   - On login/register success: await SessionManager.saveTokens({ accessToken, refreshToken })
 *   - On app start: const tokens = await SessionManager.getTokens()
 *   - On logout: await SessionManager.clearSession()
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@hospital_access_token';
const REFRESH_TOKEN_KEY = '@hospital_refresh_token';
const USER_DATA_KEY = '@hospital_user_data';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserData {
  id?: number;
  email: string;
  nombres?: string;
  apellidos?: string;
  celular?: string;
  fechaNacimiento?: string | null;
  tipoDocumento?: string | null;
  nroDocumento?: string | null;
  profileImage?: string | null;
  role?: string;
}

export const SessionManager = {
  /**
   * Save auth tokens after login or register.
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, tokens.accessToken],
        [REFRESH_TOKEN_KEY, tokens.refreshToken],
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  /**
   * Retrieve the current tokens.
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const pairs = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      const accessToken = pairs[0][1];
      const refreshToken = pairs[1][1];
      if (!accessToken || !refreshToken) return null;
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error reading tokens:', error);
      return null;
    }
  },

  /**
   * Get only the access token (used by interceptor).
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error reading access token:', error);
      return null;
    }
  },

  /**
   * Get only the refresh token (used by interceptor).
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error reading refresh token:', error);
      return null;
    }
  },

  /**
   * Check if a session exists (quick boolean check).
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  },

  /**
   * Save user profile data.
   */
  async saveUserData(data: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  /**
   * Retrieve user profile data.
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserData;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  },

  /**
   * Clear the entire session (logout).
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
};
