/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * StorageAdapter interface defines the standard API for data persistence
 * in the Second Thought Shell. This decouples the frontend logic from
 * any specific database vendor or hosting environment.
 *
 * The interface is synchronous: the browser adapters that ship with the site
 * (localStorage and in-memory) always read/write instantly, so callers can use
 * the returned value directly without awaiting it. Cloud backends can still be
 * added later behind this same adapter contract by wrapping the synchronous
 * calls (e.g. awaiting the backend internally before resolving), so the app
 * code does not need to change.
 */
export interface StorageAdapter {
  /**
   * Retrieves a typed value by its key.
   */
  getItem<T>(key: string, defaultValue: T): T;

  /**
   * Saves a value under the specified key.
   *
   * Returns `false` when the write fails (for example a localStorage quota
   * error) so callers can show clear feedback instead of the save silently
   * failing. Returns `true` on success.
   */
  setItem<T>(key: string, value: T): boolean;

  /**
   * Removes a key and its associated value from storage.
   */
  removeItem(key: string): void;

  /**
   * Clears all shell data.
   */
  clear(): void;
}

/**
 * 1. LOCAL STORAGE ADAPTER (Default)
 * Fully deployment-agnostic, works instantly in any modern web browser, Replit, Vercel, Netlify.
 */
export class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Error reading key "${key}":`, error);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      const isQuota =
        error?.name === 'QuotaExceededError' ||
        error?.code === 22 ||
        error?.code === 1014;
      // Quota overflow is the most common reason a save "silently" fails (e.g.
      // large images stored as base64). Report it clearly instead of quietly
      // swallowing it so callers can compress the value or tell the user.
      console.warn(
        `[LocalStorageAdapter] Error writing key "${key}": ${
          isQuota
            ? 'Storage quota exceeded. The value was too large to save locally.'
            : (error?.message ?? String(error))
        }`
      );
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Error removing key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Error clearing storage:`, error);
    }
  }
}

/**
 * 2. IN-MEMORY STORAGE ADAPTER
 * Fallback for heavily restricted sandboxes or iframe environments where localStorage is blocked.
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private cache = new Map<string, string>();

  getItem<T>(key: string, defaultValue: T): T {
    const item = this.cache.get(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  setItem<T>(key: string, value: T): boolean {
    this.cache.set(key, JSON.stringify(value));
    return true;
  }

  removeItem(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * 3. EXAMPLES FOR FUTURE CLOUD STORAGE EXTENSION
 *
 * --- FIREBASE FIRESTORE ADAPTER (Skeleton) ---
 * 
 * import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
 * 
 * export class FirestoreStorageAdapter implements StorageAdapter {
 *   private db = getFirestore();
 *   private userId: string;
 * 
 *   constructor(userId: string) {
 *     this.userId = userId;
 *   }
 * 
 *   async getItem<T>(key: string, defaultValue: T): Promise<T> {
 *     // (Cloud reads are network-bound; present a synchronous facade by keeping
 *     // a local mirror cache that is refreshed in the background. The public
 *     // `getItem` below returns the cached value immediately, so callers see
 *     // the synchronous contract while the cache is populated asynchronously.)
 *     try {
 *       const docRef = doc(this.db, 'users', this.userId, 'shell_data', key);
 *       const docSnap = await getDoc(docRef);
 *       if (docSnap.exists()) {
 *         return docSnap.data().value as T;
 *       }
 *     } catch (e) {
 *       console.error("Firestore read error", e);
 *     }
 *     return defaultValue;
 *   }
 * 
 *   async setItem<T>(key: string, value: T): Promise<boolean> {
 *     const docRef = doc(this.db, 'users', this.userId, 'shell_data', key);
 *     await setDoc(docRef, { value, updatedAt: new Date().toISOString() });
 *     return true;
 *   }
 * 
 *   async removeItem(key: string): Promise<void> {
 *     const docRef = doc(this.db, 'users', this.userId, 'shell_data', key);
 *     await deleteDoc(docRef);
 *   }
 * 
 *   async clear(): Promise<void> {
 *     // Implement batch delete or collection wipe if necessary
 *   }
 * }
 * 
 * 
 * --- SUPABASE ADAPTER (Skeleton) ---
 * 
 * import { createClient } from '@supabase/supabase-js';
 * 
 * export class SupabaseStorageAdapter implements StorageAdapter {
 *   private supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');
 * 
 *   async getItem<T>(key: string, defaultValue: T): Promise<T> {
 *     const { data, error } = await this.supabase
 *       .from('shell_settings')
 *       .select('value')
 *       .eq('key', key)
 *       .single();
 *       
 *     if (error || !data) return defaultValue;
 *     return data.value as T;
 *   }
 * 
 *   async setItem<T>(key: string, value: T): Promise<boolean> {
 *     await this.supabase
 *       .from('shell_settings')
 *       .upsert({ key, value, updated_at: new Date() });
 *     return true;
 *   }
 * 
 *   async removeItem(key: string): Promise<void> {
 *     await this.supabase
 *       .from('shell_settings')
 *       .delete()
 *       .eq('key', key);
 *   }
 * 
 *   async clear(): Promise<void> {
 *     // Delete all rows for the active user session
 *   }
 * }
 */

// Detect standard environment and initialize default provider
const selectDefaultAdapter = (): StorageAdapter => {
  try {
    // Check if localStorage is supported and accessible
    const testKey = '__st_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return new LocalStorageAdapter();
  } catch (e) {
    console.warn('[Storage] localStorage is not available. Falling back to InMemoryStorageAdapter.');
    return new InMemoryStorageAdapter();
  }
};

/**
 * Global storage service instance.
 * Import this to read/write state in a cloud-ready, backend-agnostic manner.
 */
export const storage: StorageAdapter = selectDefaultAdapter();
