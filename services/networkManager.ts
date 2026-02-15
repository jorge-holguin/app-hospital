/**
 * Network Manager — Monitors connectivity and triggers sync when back online.
 *
 * Uses @react-native-community/netinfo to detect network changes.
 * When connectivity is restored, processes the sync_queue.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios from 'axios';
import { SessionManager } from '@/utils/session';
import {
  getPendingRequests,
  markInProgress,
  removeRequest,
  incrementRetry,
} from './offlineDatabase';

type NetworkListener = (isConnected: boolean) => void;

let _isConnected = true;
let _unsubscribe: (() => void) | null = null;
let _isSyncing = false;
const _listeners: NetworkListener[] = [];

/**
 * Start listening for network changes.
 * Call this once at app startup.
 */
export function startNetworkMonitor(): void {
  if (_unsubscribe) return; // already started

  _unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasConnected = _isConnected;
    _isConnected = !!(state.isConnected && state.isInternetReachable !== false);

    // Notify listeners
    _listeners.forEach((fn) => fn(_isConnected));

    // If we just came back online, trigger sync
    if (!wasConnected && _isConnected) {
      console.log('[Network] Back online — starting sync...');
      syncPendingRequests();
    }
  });

  // Initial state check
  NetInfo.fetch().then((state) => {
    _isConnected = !!(state.isConnected && state.isInternetReachable !== false);
  });
}

/**
 * Stop listening for network changes.
 */
export function stopNetworkMonitor(): void {
  if (_unsubscribe) {
    _unsubscribe();
    _unsubscribe = null;
  }
}

/**
 * Returns current connectivity status (synchronous).
 */
export function isOnline(): boolean {
  return _isConnected;
}

/**
 * Register a listener for connectivity changes.
 */
export function addNetworkListener(listener: NetworkListener): () => void {
  _listeners.push(listener);
  return () => {
    const idx = _listeners.indexOf(listener);
    if (idx >= 0) _listeners.splice(idx, 1);
  };
}

/**
 * Process all pending requests in the sync queue.
 * Called automatically when connectivity is restored, or manually.
 */
export async function syncPendingRequests(): Promise<void> {
  if (_isSyncing || !_isConnected) return;
  _isSyncing = true;

  try {
    const pending = await getPendingRequests();
    if (pending.length === 0) {
      console.log('[Sync] No pending requests.');
      return;
    }

    console.log(`[Sync] Processing ${pending.length} pending request(s)...`);

    for (const item of pending) {
      try {
        await markInProgress(item.id);

        const headers = JSON.parse(item.headers);
        // Refresh auth header with current token
        const accessToken = await SessionManager.getAccessToken();
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        await axios({
          method: item.method as any,
          url: item.url,
          headers,
          data: item.body ? JSON.parse(item.body) : undefined,
          timeout: 30000,
        });

        await removeRequest(item.id);
        console.log(`[Sync] ✓ Synced request #${item.id}: ${item.method} ${item.url}`);
      } catch (error: any) {
        console.warn(`[Sync] ✗ Failed request #${item.id}:`, error.message);
        await incrementRetry(item.id);
      }
    }
  } catch (error) {
    console.error('[Sync] Error processing queue:', error);
  } finally {
    _isSyncing = false;
  }
}
