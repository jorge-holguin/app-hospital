/**
 * Session persistence utility using AsyncStorage.
 * Keeps the user session always active in the app.
 *
 * Usage:
 *   - On login success: await SessionManager.saveSession({ token, user })
 *   - On app start: const session = await SessionManager.getSession()
 *   - On logout: await SessionManager.clearSession()
 *   - The session does NOT expire — it persists until explicitly cleared.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@hospital_session';

export interface SessionData {
  token: string;
  userId: string;
  documentNumber: string;
  fullName: string;
  loginTimestamp: number;
}

export const SessionManager = {
  /**
   * Save session data to persistent storage.
   * Call this after a successful login.
   */
  async saveSession(data: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  /**
   * Retrieve the current session.
   * Returns null if no session exists.
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SessionData;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  },

  /**
   * Check if a session exists (quick boolean check).
   */
  async isLoggedIn(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  },

  /**
   * Clear the session (logout).
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  /**
   * Update a specific field in the session without replacing the whole object.
   */
  async updateSession(partial: Partial<SessionData>): Promise<void> {
    const current = await this.getSession();
    if (current) {
      await this.saveSession({ ...current, ...partial });
    }
  },
};
