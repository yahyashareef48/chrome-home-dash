// Types and Interfaces
interface BackgroundImage {
  id: string;
  url: string;
  name: string;
  isCustom: boolean;
  photographer?: string;
  photographerUrl?: string;
  position?: string; // CSS background-position value (e.g., "center", "top", "50% 30%")
}

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string; // URL to favicon or custom icon
}

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
}

interface ThemePreset {
  id: string;
  name: string;
  colors: ColorScheme;
}

interface ThemeConfig {
  backgroundImage: BackgroundImage;
  colorScheme: ColorScheme;
  useCustomColors: boolean;
  presetId?: string;
  blurIntensity: number;
  overlayOpacity: number;
}

const DEFAULT_IMAGES: BackgroundImage[] = [
  {
    id: "bg-1",
    url: "1.jpg",
    name: "Earth from Space",
    isCustom: false,
  },
  {
    id: "bg-2",
    url: "2.jpg",
    name: "Mountain Range",
    isCustom: false,
  },
  {
    id: "bg-3",
    url: "3.jpg",
    name: "Viaduct Train",
    isCustom: false,
  },
];

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "light",
    name: "Light",
    colors: {
      primary: "#007AFF",
      secondary: "#5856D6",
      accent: "#FF9500",
      background: "rgba(255, 255, 255, 0.8)",
      text: "#000000",
      textSecondary: "#8E8E93",
    },
  },
  {
    id: "dark",
    name: "Dark",
    colors: {
      primary: "#0A84FF",
      secondary: "#5E5CE6",
      accent: "#FF9F0A",
      background: "rgba(28, 28, 30, 0.8)",
      text: "#FFFFFF",
      textSecondary: "#98989D",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      primary: "#00B4D8",
      secondary: "#0077B6",
      accent: "#90E0EF",
      background: "rgba(3, 37, 65, 0.85)",
      text: "#FFFFFF",
      textSecondary: "#CAF0F8",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      primary: "#F77F00",
      secondary: "#D62828",
      accent: "#FCBF49",
      background: "rgba(3, 7, 30, 0.8)",
      text: "#FFFFFF",
      textSecondary: "#EAE2B7",
    },
  },
];

const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: DEFAULT_IMAGES[0],
  colorScheme: THEME_PRESETS[1].colors,
  useCustomColors: false,
  presetId: "dark",
  blurIntensity: 0,
  overlayOpacity: 0,
};

// Unsplash API Manager
class UnsplashAPI {
  private static API_KEY = "aOU7kRQy1u9KPcroGJcPT7dRPYEAbBAbw7T_3A5NG2I"; // User needs to replace this
  private static API_URL = "https://api.unsplash.com";

  static async searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<UnsplashPhoto[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching from Unsplash:", error);
      return [];
    }
  }

  static async getRandomPhotos(count: number = 12, query?: string): Promise<UnsplashPhoto[]> {
    try {
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : "";
      const response = await fetch(`${this.API_URL}/photos/random?count=${count}${queryParam}&client_id=${this.API_KEY}`);

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching random photos:", error);
      return [];
    }
  }

  static async downloadPhoto(photo: UnsplashPhoto): Promise<string | null> {
    try {
      // Trigger download tracking (required by Unsplash API guidelines)
      fetch(`${photo.links.download_location}?client_id=${this.API_KEY}`);

      // Fetch the actual image
      const response = await fetch(photo.urls.regular);
      const blob = await response.blob();

      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error downloading photo:", error);
      return null;
    }
  }
}

// Default Shortcuts
const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com",
    icon: "https://www.google.com/favicon.ico",
  },
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com",
    icon: "https://www.youtube.com/favicon.ico",
  },
  {
    id: "gmail",
    name: "Gmail",
    url: "https://mail.google.com",
    icon: "https://mail.google.com/favicon.ico",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com",
    icon: "https://github.com/favicon.ico",
  },
];

// Storage Manager
class ThemeStorage {
  private static STORAGE_KEY = "themeConfig";
  private static UNSPLASH_IMAGES_KEY = "unsplashImages";
  private static CUSTOM_IMAGES_KEY = "customImages";
  private static SHORTCUTS_KEY = "shortcuts";

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
}

// Shortcuts Manager
class ShortcutsManager {
  private shortcuts: Shortcut[] = [];
  private gridElement: HTMLElement | null = null;
  private modalElement: HTMLElement | null = null;
  private formElement: HTMLFormElement | null = null;
  private editingShortcutId: string | null = null;

  constructor() {
    this.gridElement = document.getElementById("shortcutsGrid");
    this.modalElement = document.getElementById("shortcutModal");
    this.formElement = document.getElementById("shortcutForm") as HTMLFormElement;
  }

  async init(): Promise<void> {
    this.shortcuts = await ThemeStorage.getShortcuts();
    this.render();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const addBtn = document.getElementById("addShortcutBtn");
    const closeBtn = document.getElementById("closeShortcutModal");
    const cancelBtn = document.getElementById("cancelShortcut");

    addBtn?.addEventListener("click", () => this.showModal());
    closeBtn?.addEventListener("click", () => this.hideModal());
    cancelBtn?.addEventListener("click", () => this.hideModal());

    this.modalElement?.addEventListener("click", (e) => {
      if (e.target === this.modalElement) {
        this.hideModal();
      }
    });

    this.formElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private render(): void {
    if (!this.gridElement) return;

    this.gridElement.innerHTML = "";

    this.shortcuts.forEach((shortcut) => {
      const item = document.createElement("div");
      item.className = "shortcut-item";
      item.dataset.shortcutId = shortcut.id;

      // Create icon
      const icon = document.createElement("img");
      icon.className = "shortcut-icon";
      icon.src = shortcut.icon || this.getFaviconUrl(shortcut.url);
      icon.alt = shortcut.name;
      icon.onerror = () => {
        // Fallback to first letter if favicon fails
        icon.style.display = "none";
        const fallback = document.createElement("div");
        fallback.style.cssText = `
          width: 32px;
          height: 32px;
          background: var(--color-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        `;
        fallback.textContent = shortcut.name.charAt(0).toUpperCase();
        item.insertBefore(fallback, icon);
      };

      // Create name
      const name = document.createElement("div");
      name.className = "shortcut-name";
      name.textContent = shortcut.name;
      name.title = shortcut.name;

      // Create delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "shortcut-delete-btn";
      deleteBtn.innerHTML = "×";
      deleteBtn.title = "Delete shortcut";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteShortcut(shortcut.id);
      });

      // Add click handler to open URL
      item.addEventListener("click", () => {
        window.open(shortcut.url, "_blank");
      });

      // Right click to edit
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.editShortcut(shortcut);
      });

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(deleteBtn);
      this.gridElement?.appendChild(item);
    });
  }

  private getFaviconUrl(url: string): string {
    try {
      const domain = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${domain.hostname}&sz=64`;
    } catch {
      return "";
    }
  }

  private showModal(shortcut?: Shortcut): void {
    if (!this.modalElement || !this.formElement) return;

    const titleElement = document.getElementById("shortcutModalTitle");
    const nameInput = document.getElementById("shortcutName") as HTMLInputElement;
    const urlInput = document.getElementById("shortcutUrl") as HTMLInputElement;
    const iconInput = document.getElementById("shortcutIcon") as HTMLInputElement;

    if (shortcut) {
      // Edit mode
      this.editingShortcutId = shortcut.id;
      if (titleElement) titleElement.textContent = "Edit Shortcut";
      nameInput.value = shortcut.name;
      urlInput.value = shortcut.url;
      iconInput.value = shortcut.icon || "";
    } else {
      // Add mode
      this.editingShortcutId = null;
      if (titleElement) titleElement.textContent = "Add Shortcut";
      this.formElement.reset();
    }

    this.modalElement.classList.add("open");
  }

  private hideModal(): void {
    this.modalElement?.classList.remove("open");
    this.formElement?.reset();
    this.editingShortcutId = null;
  }

  private async handleSubmit(): Promise<void> {
    const nameInput = document.getElementById("shortcutName") as HTMLInputElement;
    const urlInput = document.getElementById("shortcutUrl") as HTMLInputElement;
    const iconInput = document.getElementById("shortcutIcon") as HTMLInputElement;

    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const icon = iconInput.value.trim();

    if (!name || !url) return;

    // Add https:// if no protocol specified
    if (!url.match(/^https?:\/\//i)) {
      url = "https://" + url;
    }

    const shortcut: Shortcut = {
      id: this.editingShortcutId || `shortcut-${Date.now()}`,
      name,
      url,
      icon: icon || undefined,
    };

    if (this.editingShortcutId) {
      // Update existing
      await ThemeStorage.updateShortcut(shortcut);
    } else {
      // Add new
      await ThemeStorage.addShortcut(shortcut);
    }

    this.shortcuts = await ThemeStorage.getShortcuts();
    this.render();
    this.hideModal();
  }

  private editShortcut(shortcut: Shortcut): void {
    this.showModal(shortcut);
  }

  private async deleteShortcut(id: string): Promise<void> {
    if (!confirm("Delete this shortcut?")) return;

    await ThemeStorage.deleteShortcut(id);
    this.shortcuts = await ThemeStorage.getShortcuts();
    this.render();
  }
}

// Theme Manager
class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private backgroundElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor() {
    this.backgroundElement = document.getElementById("background");
    this.overlayElement = document.getElementById("overlay");
  }

  async init(): Promise<void> {
    this.currentTheme = await ThemeStorage.load();
    this.applyTheme(this.currentTheme);

    ThemeStorage.onChange((config) => {
      this.currentTheme = config;
      this.applyTheme(config);
    });
  }

  applyTheme(config: ThemeConfig): void {
    this.applyBackground(config.backgroundImage);
    this.applyColors(config.colorScheme);
    this.applyBlur(config.blurIntensity);
    this.applyOverlay(config.overlayOpacity);
  }

  private applyBackground(image: BackgroundImage): void {
    if (!this.backgroundElement) return;

    this.backgroundElement.style.backgroundImage = `url('${image.url}')`;
    this.backgroundElement.style.backgroundPosition = image.position || "center";
    this.backgroundElement.style.opacity = "0";

    setTimeout(() => {
      if (this.backgroundElement) {
        this.backgroundElement.style.opacity = "1";
      }
    }, 50);
  }

  private applyColors(colors: ColorScheme): void {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-text-secondary", colors.textSecondary);
  }

  private applyBlur(intensity: number): void {
    if (!this.backgroundElement) return;
    this.backgroundElement.style.filter = `blur(${intensity * 0.1}px)`;
  }

  private applyOverlay(opacity: number): void {
    if (!this.overlayElement) return;
    this.overlayElement.style.opacity = (opacity / 100).toString();
  }

  async updateBackground(image: BackgroundImage): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.backgroundImage = image;
    this.applyBackground(image);
    await ThemeStorage.save(this.currentTheme);
  }

  async updateColors(colors: ColorScheme, presetId?: string): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.colorScheme = colors;
    this.currentTheme.presetId = presetId;
    this.currentTheme.useCustomColors = !presetId;
    this.applyColors(colors);
    await ThemeStorage.save(this.currentTheme);
  }

  async updateBlur(intensity: number): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.blurIntensity = intensity;
    this.applyBlur(intensity);
    await ThemeStorage.save(this.currentTheme);
  }

  async updateOverlay(opacity: number): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.overlayOpacity = opacity;
    this.applyOverlay(opacity);
    await ThemeStorage.save(this.currentTheme);
  }

  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  async resetTheme(): Promise<void> {
    await ThemeStorage.reset();
    this.currentTheme = await ThemeStorage.load();
    this.applyTheme(this.currentTheme);
  }
}

// Main App
class App {
  private themeManager: ThemeManager;
  private shortcutsManager: ShortcutsManager;
  private settingsPanel: HTMLElement | null;
  private isSettingsOpen = false;
  private unsplashImages: BackgroundImage[] = [];
  private customImages: BackgroundImage[] = [];
  private isLoadingUnsplash = false;

  constructor() {
    this.themeManager = new ThemeManager();
    this.shortcutsManager = new ShortcutsManager();
    this.settingsPanel = document.getElementById("settingsPanel");
    this.init();
  }

  async init() {
    await this.themeManager.init();
    await this.shortcutsManager.init();
    this.unsplashImages = await ThemeStorage.getUnsplashImages();
    this.customImages = await ThemeStorage.getCustomImages();

    this.setupSettings();
    this.renderBackgrounds();
    this.renderThemePresets();
    this.loadCurrentTheme();
  }

  setupSettings() {
    const settingsToggle = document.getElementById("settingsToggle");
    const closeSettings = document.getElementById("closeSettings");
    const blurSlider = document.getElementById("blurSlider") as HTMLInputElement;
    const overlaySlider = document.getElementById("overlaySlider") as HTMLInputElement;
    const resetBtn = document.getElementById("resetTheme");
    const addCustomBg = document.getElementById("addCustomBg");

    settingsToggle?.addEventListener("click", () => this.toggleSettings());
    closeSettings?.addEventListener("click", () => this.toggleSettings());

    blurSlider?.addEventListener("input", (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.themeManager.updateBlur(value);
    });

    overlaySlider?.addEventListener("input", (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.themeManager.updateOverlay(value);
    });

    resetBtn?.addEventListener("click", async () => {
      if (confirm("Are you sure you want to reset all settings to default?")) {
        await this.themeManager.resetTheme();
        this.renderBackgrounds();
        this.renderThemePresets();
        this.loadCurrentTheme();
      }
    });

    addCustomBg?.addEventListener("click", () => this.addCustomBackground());

    // Unsplash button
    const unsplashBtn = document.getElementById("browseUnsplash");
    unsplashBtn?.addEventListener("click", () => this.loadRandomUnsplash());

    // Adjust position button
    const adjustPositionBtn = document.getElementById("adjustPosition");
    adjustPositionBtn?.addEventListener("click", () => this.showPositionAdjuster());
  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.settingsPanel?.classList.toggle("open", this.isSettingsOpen);
  }

  renderBackgrounds() {
    const grid = document.getElementById("backgroundGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const currentTheme = this.themeManager.getCurrentTheme();

    // Default images
    DEFAULT_IMAGES.forEach((image) => {
      const option = document.createElement("div");
      option.className = "bg-option";
      option.style.backgroundImage = `url('${image.url}')`;
      option.dataset.imageId = image.id;

      if (currentTheme?.backgroundImage.id === image.id) {
        option.classList.add("active");
      }

      option.addEventListener("click", () => {
        this.themeManager.updateBackground(image);
        this.renderBackgrounds();
      });

      grid.appendChild(option);
    });

    // Custom uploaded images
    this.customImages.forEach((image) => {
      const option = document.createElement("div");
      option.className = "bg-option";
      option.style.backgroundImage = `url('${image.url}')`;
      option.dataset.imageId = image.id;

      if (currentTheme?.backgroundImage.id === image.id) {
        option.classList.add("active");
      }

      // Add delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-bg-btn";
      deleteBtn.innerHTML = "×";
      deleteBtn.title = "Delete image";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm("Delete this image?")) {
          await this.deleteCustomImage(image.id);
        }
      });
      option.appendChild(deleteBtn);

      // Add custom badge
      const badge = document.createElement("div");
      badge.className = "photo-credit";
      badge.textContent = "Custom";
      option.appendChild(badge);

      option.addEventListener("click", () => {
        this.themeManager.updateBackground(image);
        this.renderBackgrounds();
      });

      grid.appendChild(option);
    });

    // Unsplash saved images
    this.unsplashImages.forEach((image) => {
      const option = document.createElement("div");
      option.className = "bg-option";
      option.style.backgroundImage = `url('${image.url}')`;
      option.dataset.imageId = image.id;

      if (currentTheme?.backgroundImage.id === image.id) {
        option.classList.add("active");
      }

      // Add delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-bg-btn";
      deleteBtn.innerHTML = "×";
      deleteBtn.title = "Delete image";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm("Delete this image?")) {
          await this.deleteUnsplashImage(image.id);
        }
      });
      option.appendChild(deleteBtn);

      // Add attribution badge
      if (image.photographer) {
        const badge = document.createElement("div");
        badge.className = "photo-credit";
        badge.textContent = image.photographer;
        option.appendChild(badge);
      }

      option.addEventListener("click", () => {
        this.themeManager.updateBackground(image);
        this.renderBackgrounds();
      });

      grid.appendChild(option);
    });
  }

  renderThemePresets() {
    const container = document.getElementById("themePresets");
    if (!container) return;

    container.innerHTML = "";
    const currentTheme = this.themeManager.getCurrentTheme();

    THEME_PRESETS.forEach((preset) => {
      const presetElement = document.createElement("div");
      presetElement.className = "theme-preset";
      presetElement.dataset.presetId = preset.id;

      if (currentTheme?.presetId === preset.id) {
        presetElement.classList.add("active");
      }

      const preview = document.createElement("div");
      preview.className = "theme-preview";
      preview.style.background = `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`;

      const name = document.createElement("div");
      name.className = "theme-preset-name";
      name.textContent = preset.name;

      presetElement.appendChild(preview);
      presetElement.appendChild(name);

      presetElement.addEventListener("click", () => {
        this.themeManager.updateColors(preset.colors, preset.id);
        this.renderThemePresets();
      });

      container.appendChild(presetElement);
    });
  }

  loadCurrentTheme() {
    const currentTheme = this.themeManager.getCurrentTheme();
    if (!currentTheme) return;

    const blurSlider = document.getElementById("blurSlider") as HTMLInputElement;
    const overlaySlider = document.getElementById("overlaySlider") as HTMLInputElement;

    if (blurSlider) blurSlider.value = currentTheme.blurIntensity.toString();
    if (overlaySlider) overlaySlider.value = currentTheme.overlayOpacity.toString();
  }

  addCustomBackground() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const customImage: BackgroundImage = {
          id: `custom-${Date.now()}`,
          url: dataUrl,
          name: file.name,
          isCustom: true,
        };

        // Save to storage
        await ThemeStorage.saveCustomImage(customImage);
        this.customImages = await ThemeStorage.getCustomImages();

        // Set as background
        await this.themeManager.updateBackground(customImage);
        this.renderBackgrounds();
      };

      reader.readAsDataURL(file);
    });

    input.click();
  }

  async deleteCustomImage(imageId: string) {
    await ThemeStorage.deleteCustomImage(imageId);
    this.customImages = await ThemeStorage.getCustomImages();

    // If deleted image was active, switch to default
    const currentTheme = this.themeManager.getCurrentTheme();
    if (currentTheme?.backgroundImage.id === imageId) {
      await this.themeManager.updateBackground(DEFAULT_IMAGES[0]);
    }

    this.renderBackgrounds();
  }

  async deleteUnsplashImage(imageId: string) {
    await ThemeStorage.deleteUnsplashImage(imageId);
    this.unsplashImages = await ThemeStorage.getUnsplashImages();

    // If deleted image was active, switch to default
    const currentTheme = this.themeManager.getCurrentTheme();
    if (currentTheme?.backgroundImage.id === imageId) {
      await this.themeManager.updateBackground(DEFAULT_IMAGES[0]);
    }

    this.renderBackgrounds();
  }

  async searchUnsplash(query: string) {
    if (this.isLoadingUnsplash) return;

    this.isLoadingUnsplash = true;
    const modal = this.showUnsplashModal();
    const resultsContainer = modal.querySelector(".unsplash-results");

    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="loading">Searching Unsplash...</div>';
    }

    const photos = await UnsplashAPI.searchPhotos(query, 1, 20);

    if (resultsContainer) {
      resultsContainer.innerHTML = "";

      if (photos.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No images found. Try a different search term.</div>';
      } else {
        photos.forEach((photo) => this.renderUnsplashPhoto(photo, resultsContainer));
      }
    }

    this.isLoadingUnsplash = false;
  }

  async loadRandomUnsplash() {
    if (this.isLoadingUnsplash) return;

    this.isLoadingUnsplash = true;
    const modal = this.showUnsplashModal();
    const resultsContainer = modal.querySelector(".unsplash-results");

    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="loading">Loading random photos...</div>';
    }

    const photos = await UnsplashAPI.getRandomPhotos(20);

    if (resultsContainer) {
      resultsContainer.innerHTML = "";

      if (photos.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Failed to load images. Please try again.</div>';
      } else {
        photos.forEach((photo) => this.renderUnsplashPhoto(photo, resultsContainer));
      }
    }

    this.isLoadingUnsplash = false;
  }

  renderUnsplashPhoto(photo: UnsplashPhoto, container: Element) {
    const photoDiv = document.createElement("div");
    photoDiv.className = "unsplash-photo";
    photoDiv.style.backgroundImage = `url('${photo.urls.small}')`;

    const attribution = document.createElement("div");
    attribution.className = "unsplash-attribution";
    attribution.innerHTML = `Photo by <a href="${photo.user.links.html}" target="_blank">${photo.user.name}</a>`;

    photoDiv.appendChild(attribution);

    photoDiv.addEventListener("click", async () => {
      photoDiv.classList.add("downloading");
      await this.selectUnsplashPhoto(photo);
      photoDiv.classList.remove("downloading");
    });

    container.appendChild(photoDiv);
  }

  async selectUnsplashPhoto(photo: UnsplashPhoto) {
    // Download and convert to base64
    const base64 = await UnsplashAPI.downloadPhoto(photo);

    if (!base64) {
      alert("Failed to download image. Please try again.");
      return;
    }

    const image: BackgroundImage = {
      id: `unsplash-${photo.id}`,
      url: base64,
      name: `Photo by ${photo.user.name}`,
      isCustom: false,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    };

    // Save to storage
    await ThemeStorage.saveUnsplashImage(image);
    this.unsplashImages = await ThemeStorage.getUnsplashImages();

    // Set as background
    await this.themeManager.updateBackground(image);

    // Close modal and update UI
    this.closeUnsplashModal();
    this.renderBackgrounds();
  }

  showUnsplashModal(): HTMLElement {
    let modal = document.getElementById("unsplashModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "unsplashModal";
      modal.className = "unsplash-modal";
      modal.innerHTML = `
        <div class="unsplash-modal-content">
          <div class="unsplash-modal-header">
            <h3>Browse Unsplash</h3>
            <button class="close-modal-btn" id="closeUnsplashModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="unsplash-search-bar">
            <input type="text" id="unsplashSearch" placeholder="Search for images...">
            <button id="unsplashSearchBtn">Search</button>
            <button id="unsplashRandomBtn">Random</button>
          </div>
          <div class="unsplash-results"></div>
          <div class="unsplash-footer">
            Images from <a href="https://unsplash.com" target="_blank">Unsplash</a>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Set up event listeners
      const closeBtn = modal.querySelector("#closeUnsplashModal");
      closeBtn?.addEventListener("click", () => this.closeUnsplashModal());

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeUnsplashModal();
        }
      });

      const searchInput = modal.querySelector("#unsplashSearch") as HTMLInputElement;
      const searchBtn = modal.querySelector("#unsplashSearchBtn");
      const randomBtn = modal.querySelector("#unsplashRandomBtn");

      searchBtn?.addEventListener("click", () => {
        const query = searchInput?.value.trim();
        if (query) {
          this.searchUnsplash(query);
        }
      });

      searchInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = searchInput.value.trim();
          if (query) {
            this.searchUnsplash(query);
          }
        }
      });

      randomBtn?.addEventListener("click", () => this.loadRandomUnsplash());
    }

    modal.classList.add("open");
    return modal;
  }

  closeUnsplashModal() {
    const modal = document.getElementById("unsplashModal");
    modal?.classList.remove("open");
  }

  showPositionAdjuster() {
    const currentTheme = this.themeManager.getCurrentTheme();
    if (!currentTheme) return;

    const bgElement = document.getElementById("background");
    if (!bgElement) return;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "position-adjuster-overlay";
    overlay.innerHTML = `
      <div class="position-adjuster-content">
        <h3>Adjust Background Position</h3>
        <p>Click and drag to position the image</p>
        <div class="position-preview" id="positionPreview"></div>
        <div class="position-presets">
          <button data-pos="center">Center</button>
          <button data-pos="top">Top</button>
          <button data-pos="bottom">Bottom</button>
          <button data-pos="left">Left</button>
          <button data-pos="right">Right</button>
          <button data-pos="top left">Top Left</button>
          <button data-pos="top right">Top Right</button>
          <button data-pos="bottom left">Bottom Left</button>
          <button data-pos="bottom right">Bottom Right</button>
        </div>
        <div class="position-adjuster-actions">
          <button class="btn-primary" id="savePosition">Save</button>
          <button class="btn-secondary" id="cancelPosition">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const preview = overlay.querySelector("#positionPreview") as HTMLElement;
    if (preview) {
      preview.style.backgroundImage = bgElement.style.backgroundImage;
      preview.style.backgroundPosition = currentTheme.backgroundImage.position || "center";
    }

    let isDragging = false;
    let currentPosition = currentTheme.backgroundImage.position || "center";

    // Preset buttons
    overlay.querySelectorAll(".position-presets button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pos = (btn as HTMLElement).dataset.pos || "center";
        currentPosition = pos;
        if (preview) preview.style.backgroundPosition = pos;
      });
    });

    // Drag to position
    preview?.addEventListener("mousedown", () => {
      isDragging = true;
    });

    preview?.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = preview.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      currentPosition = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
      preview.style.backgroundPosition = currentPosition;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Save button
    overlay.querySelector("#savePosition")?.addEventListener("click", async () => {
      const updatedImage = { ...currentTheme.backgroundImage, position: currentPosition };
      await this.themeManager.updateBackground(updatedImage);

      // Update in storage if it's an Unsplash image
      if (updatedImage.id.startsWith("unsplash-")) {
        const images = await ThemeStorage.getUnsplashImages();
        const index = images.findIndex((img) => img.id === updatedImage.id);
        if (index !== -1) {
          images[index].position = currentPosition;
          await chrome.storage.local.set({ unsplashImages: images });
        }
      }

      overlay.remove();
    });

    // Cancel button
    overlay.querySelector("#cancelPosition")?.addEventListener("click", () => {
      overlay.remove();
    });

    // Click outside to close
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
