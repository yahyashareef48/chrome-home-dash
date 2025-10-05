import { ThemeConfig, DEFAULT_THEME } from './types';

const STORAGE_KEY = 'themeConfig';

export class ThemeStorage {
  /**
   * Load theme configuration from Chrome storage
   */
  static async load(): Promise<ThemeConfig> {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        return result[STORAGE_KEY] as ThemeConfig;
      }
      // Return default theme if nothing is stored
      return DEFAULT_THEME;
    } catch (error) {
      console.error('Error loading theme:', error);
      return DEFAULT_THEME;
    }
  }

  /**
   * Save theme configuration to Chrome storage
   */
  static async save(config: ThemeConfig): Promise<void> {
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: config });
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  /**
   * Reset theme to default
   */
  static async reset(): Promise<void> {
    try {
      await chrome.storage.sync.remove(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  }

  /**
   * Listen for theme changes
   */
  static onChange(callback: (config: ThemeConfig) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[STORAGE_KEY]) {
        callback(changes[STORAGE_KEY].newValue as ThemeConfig);
      }
    });
  }
}
