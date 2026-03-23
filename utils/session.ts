/**
 * Session persistence utility using AsyncStorage (mobile) or localStorage (web).
 * Stores accessToken + refreshToken from the auth API.
 *
 * Usage:
 *   - On login/register success: await SessionManager.saveTokens({ accessToken, refreshToken })
 *   - On app start: const tokens = await SessionManager.getTokens()
 *   - On logout: await SessionManager.clearSession()
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = '@hospital_access_token';
const REFRESH_TOKEN_KEY = '@hospital_refresh_token';
const USER_DATA_KEY = '@hospital_user_data';

// Web storage adapter
const webStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
  async multiSet(pairs: [string, string][]): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      pairs.forEach(([key, value]) => window.localStorage.setItem(key, value));
    }
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return keys.map(key => [key, window.localStorage.getItem(key)]);
    }
    return keys.map(key => [key, null]);
  },
  async multiRemove(keys: string[]): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      keys.forEach(key => window.localStorage.removeItem(key));
    }
  },
};

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

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
      await storage.multiSet([
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
      const pairs = await storage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
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
      return await storage.getItem(ACCESS_TOKEN_KEY);
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
      return await storage.getItem(REFRESH_TOKEN_KEY);
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
      await storage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  /**
   * Retrieve user profile data.
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const raw = await storage.getItem(USER_DATA_KEY);
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
      await storage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
};
