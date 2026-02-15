/**
 * Auth API Service
 * Base URL: http://192.168.0.252:9012/api/auth
 *
 * Endpoints:
 *   POST /login          — Login with email (DNI) + password
 *   POST /register       — Register new user
 *   POST /verify-email   — Verify email with code
 *   POST /forgot-password — Request password reset code
 *   POST /reset-password  — Reset password with code
 *   POST /refresh-token   — Refresh access token
 */

import { authClient } from './apiClient';

// ── Types ────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  fechaNacimiento: string; // YYYY-MM-DD
  password: string;
  termsAccepted: boolean;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// ── API calls ────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await authClient.post<AuthResponse>('/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await authClient.post<AuthResponse>('/register', payload);
  return data;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<void> {
  await authClient.post('/verify-email', payload);
}

export async function forgotPassword(email: string): Promise<void> {
  await authClient.post(`/forgot-password?email=${encodeURIComponent(email)}`);
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await authClient.post(
    `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(newPassword)}`,
  );
}
