import type { ThemeConfig, BackgroundImage, Shortcut } from "../types/index.js";
import { DEFAULT_THEME, DEFAULT_SHORTCUTS } from "../constants/index.js";

// Storage Manager
export class ThemeStorage {
  private static STORAGE_KEY = "themeConfig";
  private static UNSPLASH_IMAGES_KEY = "unsplashImages";
  private static CUSTOM_IMAGES_KEY = "customImages";
  private static SHORTCUTS_KEY = "shortcuts";
  private static PANELS_VISIBLE_KEY = "panelsVisible";
  private static NOTES_KEY = "notes";

  static async load(): Promise<ThemeConfig> {
    try {
      // Try local storage first (new system)
      let result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (result[this.STORAGE_KEY]) {
        return result[this.STORAGE_KEY] as ThemeConfig;
      }

      // Fallback to sync storage (old system) and migrate
      result = await chrome.storage.sync.get(this.STORAGE_KEY);
      if (result[this.STORAGE_KEY]) {
        const config = result[this.STORAGE_KEY] as ThemeConfig;
        // Migrate to local storage
        await chrome.storage.local.set({ [this.STORAGE_KEY]: config });
        await chrome.storage.sync.remove(this.STORAGE_KEY);
        return config;
      }

      return DEFAULT_THEME;
    } catch (error) {
      console.error("Error loading theme:", error);
      return DEFAULT_THEME;
    }
  }

  static async save(config: ThemeConfig): Promise<void> {
    try {
      // Use local storage for theme config because images can be large
      await chrome.storage.local.set({ [this.STORAGE_KEY]: config });
    } catch (error) {
      console.error("Error saving theme:", error);
      throw error;
    }
  }

  static async reset(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEY);
      await chrome.storage.sync.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error resetting theme:", error);
      throw error;
    }
  }

  static onChange(callback: (config: ThemeConfig) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes[this.STORAGE_KEY]) {
        callback(changes[this.STORAGE_KEY].newValue as ThemeConfig);
      }
    });
  }

  static async saveUnsplashImage(image: BackgroundImage): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.UNSPLASH_IMAGES_KEY);
      const images = result[this.UNSPLASH_IMAGES_KEY] || [];

      // Check if image already exists
      const exists = images.some((img: BackgroundImage) => img.id === image.id);
      if (!exists) {
        images.push(image);
        await chrome.storage.local.set({ [this.UNSPLASH_IMAGES_KEY]: images });
      }
    } catch (error) {
      console.error("Error saving Unsplash image:", error);
    }
  }

  static async getUnsplashImages(): Promise<BackgroundImage[]> {
    try {
      const result = await chrome.storage.local.get(this.UNSPLASH_IMAGES_KEY);
      return result[this.UNSPLASH_IMAGES_KEY] || [];
    } catch (error) {
      console.error("Error loading Unsplash images:", error);
      return [];
    }
  }

  static async deleteUnsplashImage(imageId: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.UNSPLASH_IMAGES_KEY);
      const images = result[this.UNSPLASH_IMAGES_KEY] || [];
      const filteredImages = images.filter((img: BackgroundImage) => img.id !== imageId);
      await chrome.storage.local.set({ [this.UNSPLASH_IMAGES_KEY]: filteredImages });
    } catch (error) {
      console.error("Error deleting Unsplash image:", error);
    }
  }

  static async saveCustomImage(image: BackgroundImage): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.CUSTOM_IMAGES_KEY);
      const images = result[this.CUSTOM_IMAGES_KEY] || [];

      // Check if image already exists
      const exists = images.some((img: BackgroundImage) => img.id === image.id);
      if (!exists) {
        images.push(image);
        await chrome.storage.local.set({ [this.CUSTOM_IMAGES_KEY]: images });
      }
    } catch (error) {
      console.error("Error saving custom image:", error);
    }
  }

  static async getCustomImages(): Promise<BackgroundImage[]> {
    try {
      const result = await chrome.storage.local.get(this.CUSTOM_IMAGES_KEY);
      return result[this.CUSTOM_IMAGES_KEY] || [];
    } catch (error) {
      console.error("Error loading custom images:", error);
      return [];
    }
  }

  static async deleteCustomImage(imageId: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.CUSTOM_IMAGES_KEY);
      const images = result[this.CUSTOM_IMAGES_KEY] || [];
      const filteredImages = images.filter((img: BackgroundImage) => img.id !== imageId);
      await chrome.storage.local.set({ [this.CUSTOM_IMAGES_KEY]: filteredImages });
    } catch (error) {
      console.error("Error deleting custom image:", error);
    }
  }

  static async getShortcuts(): Promise<Shortcut[]> {
    try {
      const result = await chrome.storage.local.get(this.SHORTCUTS_KEY);
      return result[this.SHORTCUTS_KEY] || DEFAULT_SHORTCUTS;
    } catch (error) {
      console.error("Error loading shortcuts:", error);
      return DEFAULT_SHORTCUTS;
    }
  }

  static async saveShortcuts(shortcuts: Shortcut[]): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.SHORTCUTS_KEY]: shortcuts });
    } catch (error) {
      console.error("Error saving shortcuts:", error);
    }
  }

  static async addShortcut(shortcut: Shortcut): Promise<void> {
    try {
      const shortcuts = await this.getShortcuts();
      shortcuts.push(shortcut);
      await this.saveShortcuts(shortcuts);
    } catch (error) {
      console.error("Error adding shortcut:", error);
    }
  }

  static async updateShortcut(shortcut: Shortcut): Promise<void> {
    try {
      const shortcuts = await this.getShortcuts();
      const index = shortcuts.findIndex((s) => s.id === shortcut.id);
      if (index !== -1) {
        shortcuts[index] = shortcut;
        await this.saveShortcuts(shortcuts);
      }
    } catch (error) {
      console.error("Error updating shortcut:", error);
    }
  }

  static async deleteShortcut(shortcutId: string): Promise<void> {
    try {
      const shortcuts = await this.getShortcuts();
      const filteredShortcuts = shortcuts.filter((s) => s.id !== shortcutId);
      await this.saveShortcuts(filteredShortcuts);
    } catch (error) {
      console.error("Error deleting shortcut:", error);
    }
  }

  static async getPanelsVisible(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(this.PANELS_VISIBLE_KEY);
      return result[this.PANELS_VISIBLE_KEY] ?? true; // Default to visible
    } catch (error) {
      console.error("Error loading panels visibility:", error);
      return true;
    }
  }

  static async setPanelsVisible(visible: boolean): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.PANELS_VISIBLE_KEY]: visible });
    } catch (error) {
      console.error("Error saving panels visibility:", error);
    }
  }

  static async getNotes(): Promise<any[]> {
    try {
      const result = await chrome.storage.local.get(this.NOTES_KEY);
      return result[this.NOTES_KEY] || [];
    } catch (error) {
      console.error("Error loading notes:", error);
      return [];
    }
  }

  static async saveNotes(notes: any[]): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.NOTES_KEY]: notes });
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  }
}
