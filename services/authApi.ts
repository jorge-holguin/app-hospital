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
  tipoDocumento: string;
  nroDocumento: string;
  digitoVerificacion?: string;
  fechaExpedicion?: string;
}

export interface TipoDocumentoOption {
  tipoDocumento: string;
  nombre: string;
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

const BASE_URL =
  process.env.EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL || 'http://192.168.5.231:9012';
const API_BASE_URL = `${BASE_URL}/api/v1/app-citas`;

/**
 * Get available document types for registration.
 */
export async function getTipoDocumentoOptions(): Promise<TipoDocumentoOption[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tipo-documento`, {
      method: 'GET',
      headers: { 'Accept': '*/*' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('[API] getTipoDocumentoOptions error:', error);
    // Return default options if API fails
    return [
      { tipoDocumento: 'D  ', nombre: 'DNI' },
      { tipoDocumento: 'CE ', nombre: 'Carnet de Extranjeria' },
    ];
  }
}
