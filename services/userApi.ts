/**
 * User API Service
 * Base URL: http://192.168.0.252:9012/api/users
 *
 * Endpoints:
 *   GET    /email?email=...           — Get user by email
 *   PUT    /{id}                      — Update user profile
 *   PUT    /{id}/password?currentPassword=...&newPassword=... — Change password
 *   POST   /{id}/image               — Upload profile image
 */

import { userClient } from './apiClient';
import { Platform } from 'react-native';

// ── Types ────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  fechaNacimiento: string | null;
  tipoDocumento: string | null;
  nroDocumento: string | null;
  ubigeo: string | null;
  profileImage: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
  password?: string;
  termsAccepted?: boolean;
}

// ── API calls ────────────────────────────────────────────────

/**
 * Get user profile by email address.
 */
export async function getUserByEmail(email: string): Promise<UserProfile> {
  const { data } = await userClient.get<UserProfile>('/email', {
    params: { email },
  });
  return data;
}

/**
 * Update user profile fields.
 */
export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<UserProfile> {
  const { data } = await userClient.put<UserProfile>(`/${userId}`, payload);
  return data;
}

/**
 * Change user password.
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await userClient.put(
    `/${userId}/password`,
    null,
    {
      params: { currentPassword, newPassword },
    },
  );
}

/**
 * Upload user profile image.
 */
export async function uploadProfileImage(
  userId: number,
  imageUri: string,
): Promise<void> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, fetch the blob and append it
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('file', blob, 'profile.jpg');
  } else {
    // On native, use the URI directly
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  await userClient.post(`/${userId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
