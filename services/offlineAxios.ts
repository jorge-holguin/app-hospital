/**
 * Offline-Aware Axios Wrapper
 *
 * Wraps the apiClient to:
 *  - Check connectivity before making requests
 *  - Queue requests in SQLite when offline
 *  - Return a "queued" response so callers know the request was saved
 *  - Use the normal apiClient (with interceptor) when online
 *
 * Usage:
 *   import { offlineRequest } from '@/services/offlineAxios';
 *   const result = await offlineRequest('POST', '/solicitudes', payload);
 *   if (result.queued) { /* show "saved offline" UI * / }
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { isOnline } from './networkManager';
import { enqueueRequest } from './offlineDatabase';
import { SessionManager } from '@/utils/session';

export interface OfflineResult<T = any> {
  queued: boolean;
  data?: T;
  status?: number;
}

/**
 * Make a request that is offline-aware.
 * - If online: executes immediately via apiClient.
 * - If offline: enqueues to SQLite and returns { queued: true }.
 *
 * @param method  HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url     Relative URL (resolved against apiClient baseURL)
 * @param data    Request body (for POST/PUT)
 * @param config  Additional axios config
 */
export async function offlineRequest<T = any>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<OfflineResult<T>> {
  if (isOnline()) {
    try {
      const response: AxiosResponse<T> = await apiClient.request({
        method,
        url,
        data,
        ...config,
      });
      return { queued: false, data: response.data, status: response.status };
    } catch (error: any) {
      // If it's a network error (not a server error), queue it
      if (!error.response) {
        await queueRequest(method, url, data, config);
        return { queued: true };
      }
      throw error;
    }
  }

  // Offline — queue the request
  await queueRequest(method, url, data, config);
  return { queued: true };
}

async function queueRequest(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<void> {
  const baseURL = apiClient.defaults.baseURL || '';
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config?.headers as Record<string, string>),
  };

  // Attach current token (will be refreshed at sync time if needed)
  const accessToken = await SessionManager.getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  await enqueueRequest(method, fullUrl, headers, data);
}
