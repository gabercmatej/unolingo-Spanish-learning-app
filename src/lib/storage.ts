import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed wrapper around AsyncStorage for JSON values. Swap the backing
 * store here (SQLite, MMKV, a sync server) without touching call sites.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      console.warn(`[storage] failed to read "${key}"`, err);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage] failed to write "${key}"`, err);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage] failed to remove "${key}"`, err);
    }
  },
};

export const StorageKeys = {
  learner: 'unolingo/learner/v1',
  /**
   * Rolling snapshots live under their own key on purpose: a learner record
   * that fails to parse must not be able to take its own backups with it.
   */
  snapshots: 'unolingo/snapshots/v1',
} as const;
