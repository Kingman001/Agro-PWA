import { OfflineDraft } from '../types';

const DB_NAME = 'glean_agro_operations_db';
const DB_VERSION = 1;
const STORE_DRAFTS = 'offline_drafts';
const STORE_CACHE = 'offline_cache';

export class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          const draftStore = db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
          draftStore.createIndex('type', 'type', { unique: false });
          draftStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Draft Operations ---
  async saveDraft(draft: OfflineDraft): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DRAFTS], 'readwrite');
        const store = transaction.objectStore(STORE_DRAFTS);
        const req = store.put(draft);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB fails
      const key = `glean_draft_${draft.id}`;
      localStorage.setItem(key, JSON.stringify(draft));
    }
  }

  async getAllDrafts(): Promise<OfflineDraft[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DRAFTS], 'readonly');
        const store = transaction.objectStore(STORE_DRAFTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      const drafts: OfflineDraft[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('glean_draft_')) {
          const val = localStorage.getItem(key);
          if (val) drafts.push(JSON.parse(val));
        }
      }
      return drafts;
    }
  }

  async deleteDraft(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DRAFTS], 'readwrite');
        const store = transaction.objectStore(STORE_DRAFTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.removeItem(`glean_draft_${id}`);
    }
  }

  // --- Offline Cache Operations for Offline Reference ---
  async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CACHE], 'readwrite');
        const store = transaction.objectStore(STORE_CACHE);
        const req = store.put({ key, data, cachedAt: new Date().toISOString() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.setItem(`glean_cache_${key}`, JSON.stringify(data));
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CACHE], 'readonly');
        const store = transaction.objectStore(STORE_CACHE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const val = localStorage.getItem(`glean_cache_${key}`);
      return val ? JSON.parse(val) : null;
    }
  }
}

export const offlineStorage = new OfflineStorageService();
