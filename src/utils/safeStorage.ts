/**
 * Safe local storage wrapper
 * Gracefully handles private browsing mode, disabled storage, QuotaExceededError,
 * and sandboxed iframe environments where window.localStorage might throw.
 */

const memoryFallbackStore = new Map<string, string>();

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback to in-memory store
    }
    return memoryFallbackStore.get(key) ?? null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch {
      // Fallback to in-memory store
    }
    try {
      memoryFallbackStore.set(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Fallback to in-memory store
    }
    memoryFallbackStore.delete(key);
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Fallback to in-memory store
    }
    memoryFallbackStore.clear();
  }
};
