// Types and Interfaces
interface BackgroundImage {
  id: string;
  url: string;
  name: string;
  isCustom: boolean;
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
    id: 'bg-1',
    url: '1.jpg',
    name: 'Earth from Space',
    isCustom: false,
  },
  {
    id: 'bg-2',
    url: '2.jpg',
    name: 'Mountain Range',
    isCustom: false,
  },
  {
    id: 'bg-3',
    url: '3.jpg',
    name: 'Viaduct Train',
    isCustom: false,
  },
];

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      background: 'rgba(255, 255, 255, 0.8)',
      text: '#000000',
      textSecondary: '#8E8E93',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      accent: '#FF9F0A',
      background: 'rgba(28, 28, 30, 0.8)',
      text: '#FFFFFF',
      textSecondary: '#98989D',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#00B4D8',
      secondary: '#0077B6',
      accent: '#90E0EF',
      background: 'rgba(3, 37, 65, 0.85)',
      text: '#FFFFFF',
      textSecondary: '#CAF0F8',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F77F00',
      secondary: '#D62828',
      accent: '#FCBF49',
      background: 'rgba(3, 7, 30, 0.8)',
      text: '#FFFFFF',
      textSecondary: '#EAE2B7',
    },
  },
];

const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: DEFAULT_IMAGES[0],
  colorScheme: THEME_PRESETS[1].colors,
  useCustomColors: false,
  presetId: 'dark',
  blurIntensity: 20,
  overlayOpacity: 30,
};

// Storage Manager
class ThemeStorage {
  private static STORAGE_KEY = 'themeConfig';

  static async load(): Promise<ThemeConfig> {
    try {
      const result = await chrome.storage.sync.get(this.STORAGE_KEY);
      if (result[this.STORAGE_KEY]) {
        return result[this.STORAGE_KEY] as ThemeConfig;
      }
      return DEFAULT_THEME;
    } catch (error) {
      console.error('Error loading theme:', error);
      return DEFAULT_THEME;
    }
  }

  static async save(config: ThemeConfig): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: config });
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  static async reset(): Promise<void> {
    try {
      await chrome.storage.sync.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  }

  static onChange(callback: (config: ThemeConfig) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[this.STORAGE_KEY]) {
        callback(changes[this.STORAGE_KEY].newValue as ThemeConfig);
      }
    });
  }
}

// Theme Manager
class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private backgroundElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor() {
    this.backgroundElement = document.getElementById('background');
    this.overlayElement = document.getElementById('overlay');
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
    this.backgroundElement.style.opacity = '0';

    setTimeout(() => {
      if (this.backgroundElement) {
        this.backgroundElement.style.opacity = '1';
      }
    }, 50);
  }

  private applyColors(colors: ColorScheme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
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
  private settingsPanel: HTMLElement | null;
  private isSettingsOpen = false;

  constructor() {
    this.themeManager = new ThemeManager();
    this.settingsPanel = document.getElementById('settingsPanel');
    this.init();
  }

  async init() {
    await this.themeManager.init();

    this.setupClock();
    this.setupSettings();
    this.renderBackgrounds();
    this.renderThemePresets();
    this.loadCurrentTheme();
  }

  setupClock() {
    const updateClock = () => {
      const now = new Date();
      const timeElement = document.getElementById('time');
      const dateElement = document.getElementById('date');

      if (timeElement) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
      }

      if (dateElement) {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  setupSettings() {
    const settingsToggle = document.getElementById('settingsToggle');
    const closeSettings = document.getElementById('closeSettings');
    const blurSlider = document.getElementById('blurSlider') as HTMLInputElement;
    const overlaySlider = document.getElementById('overlaySlider') as HTMLInputElement;
    const resetBtn = document.getElementById('resetTheme');
    const addCustomBg = document.getElementById('addCustomBg');

    settingsToggle?.addEventListener('click', () => this.toggleSettings());
    closeSettings?.addEventListener('click', () => this.toggleSettings());

    blurSlider?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.themeManager.updateBlur(value);
    });

    overlaySlider?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.themeManager.updateOverlay(value);
    });

    resetBtn?.addEventListener('click', async () => {
      await this.themeManager.resetTheme();
      this.loadCurrentTheme();
      this.renderBackgrounds();
      this.renderThemePresets();
    });

    addCustomBg?.addEventListener('click', () => this.addCustomBackground());
  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.settingsPanel?.classList.toggle('open', this.isSettingsOpen);
  }

  renderBackgrounds() {
    const grid = document.getElementById('backgroundGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const currentTheme = this.themeManager.getCurrentTheme();

    DEFAULT_IMAGES.forEach((image) => {
      const option = document.createElement('div');
      option.className = 'bg-option';
      option.style.backgroundImage = `url('${image.url}')`;
      option.dataset.imageId = image.id;

      if (currentTheme?.backgroundImage.id === image.id) {
        option.classList.add('active');
      }

      option.addEventListener('click', () => {
        this.themeManager.updateBackground(image);
        this.renderBackgrounds();
      });

      grid.appendChild(option);
    });
  }

  renderThemePresets() {
    const container = document.getElementById('themePresets');
    if (!container) return;

    container.innerHTML = '';
    const currentTheme = this.themeManager.getCurrentTheme();

    THEME_PRESETS.forEach((preset) => {
      const presetElement = document.createElement('div');
      presetElement.className = 'theme-preset';
      presetElement.dataset.presetId = preset.id;

      if (currentTheme?.presetId === preset.id) {
        presetElement.classList.add('active');
      }

      const preview = document.createElement('div');
      preview.className = 'theme-preview';
      preview.style.background = `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`;

      const name = document.createElement('div');
      name.className = 'theme-preset-name';
      name.textContent = preset.name;

      presetElement.appendChild(preview);
      presetElement.appendChild(name);

      presetElement.addEventListener('click', () => {
        this.themeManager.updateColors(preset.colors, preset.id);
        this.renderThemePresets();
      });

      container.appendChild(presetElement);
    });
  }

  loadCurrentTheme() {
    const currentTheme = this.themeManager.getCurrentTheme();
    if (!currentTheme) return;

    const blurSlider = document.getElementById('blurSlider') as HTMLInputElement;
    const overlaySlider = document.getElementById('overlaySlider') as HTMLInputElement;

    if (blurSlider) blurSlider.value = currentTheme.blurIntensity.toString();
    if (overlaySlider) overlaySlider.value = currentTheme.overlayOpacity.toString();
  }

  addCustomBackground() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', async (e) => {
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

        await this.themeManager.updateBackground(customImage);
        this.renderBackgrounds();
      };

      reader.readAsDataURL(file);
    });

    input.click();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
