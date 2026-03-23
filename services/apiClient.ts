/**
 * Axios API client with automatic token refresh interceptor.
 *
 * - Attaches accessToken to every request via Authorization header.
 * - On 401, attempts to refresh the token and retries the original request.
 * - If refresh fails, clears session and redirects to login.
 */

import { SessionManager } from '@/utils/session';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

// Base URL from environment (192.168.5.231:9012)
const BASE_URL =
  process.env.EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL || 'http://192.168.5.231:9012';

const AUTH_BASE_URL = `${BASE_URL}/api/auth`;
const API_BASE_URL = `${BASE_URL}/api/v1/app-citas`;

// ── Main API client (for protected endpoints) ────────────────
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth API client (for auth endpoints — no interceptor to avoid loops) ──
export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── User API client (for /api/users endpoints — uses token interceptor) ──
const USER_BASE_URL = AUTH_BASE_URL.replace('/auth', '/users');
export const userClient = axios.create({
  baseURL: USER_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Flag to avoid multiple simultaneous refresh calls ─────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Request interceptor: attach access token ──────────────────
function attachToken(config: InternalAxiosRequestConfig) {
  return SessionManager.getAccessToken().then((accessToken) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => attachToken(config),
  (error) => Promise.reject(error),
);

userClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => attachToken(config),
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 + refresh token ──────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SessionManager.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await authClient.post('/refresh-token', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      const { accessToken, refreshToken: newRefreshToken } = data;
      await SessionManager.saveTokens({ accessToken, refreshToken: newRefreshToken });

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      processQueue(null, accessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await SessionManager.clearSession();
      router.replace('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
