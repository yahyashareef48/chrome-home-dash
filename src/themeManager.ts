import { ThemeConfig, BackgroundImage, ColorScheme } from './types';
import { ThemeStorage } from './storage';

export class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private backgroundElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor() {
    this.backgroundElement = document.getElementById('background');
    this.overlayElement = document.getElementById('overlay');
  }

  /**
   * Initialize theme manager and load saved theme
   */
  async init(): Promise<void> {
    this.currentTheme = await ThemeStorage.load();
    this.applyTheme(this.currentTheme);

    // Listen for theme changes from other tabs
    ThemeStorage.onChange((config) => {
      this.currentTheme = config;
      this.applyTheme(config);
    });
  }

  /**
   * Apply theme configuration to the page
   */
  applyTheme(config: ThemeConfig): void {
    this.applyBackground(config.backgroundImage);
    this.applyColors(config.colorScheme);
    this.applyBlur(config.blurIntensity);
    this.applyOverlay(config.overlayOpacity);
  }

  /**
   * Set background image
   */
  private applyBackground(image: BackgroundImage): void {
    if (!this.backgroundElement) return;

    this.backgroundElement.style.backgroundImage = `url('${image.url}')`;
    this.backgroundElement.style.opacity = '0';

    // Fade in effect
    setTimeout(() => {
      if (this.backgroundElement) {
        this.backgroundElement.style.opacity = '1';
      }
    }, 50);
  }

  /**
   * Apply color scheme using CSS variables
   */
  private applyColors(colors: ColorScheme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
  }

  /**
   * Apply blur intensity to background
   */
  private applyBlur(intensity: number): void {
    if (!this.backgroundElement) return;
    this.backgroundElement.style.filter = `blur(${intensity * 0.1}px)`;
  }

  /**
   * Apply overlay opacity
   */
  private applyOverlay(opacity: number): void {
    if (!this.overlayElement) return;
    this.overlayElement.style.opacity = (opacity / 100).toString();
  }

  /**
   * Update background image
   */
  async updateBackground(image: BackgroundImage): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.backgroundImage = image;
    this.applyBackground(image);
    await ThemeStorage.save(this.currentTheme);
  }

  /**
   * Update color scheme
   */
  async updateColors(colors: ColorScheme, presetId?: string): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.colorScheme = colors;
    this.currentTheme.presetId = presetId;
    this.currentTheme.useCustomColors = !presetId;
    this.applyColors(colors);
    await ThemeStorage.save(this.currentTheme);
  }

  /**
   * Update blur intensity
   */
  async updateBlur(intensity: number): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.blurIntensity = intensity;
    this.applyBlur(intensity);
    await ThemeStorage.save(this.currentTheme);
  }

  /**
   * Update overlay opacity
   */
  async updateOverlay(opacity: number): Promise<void> {
    if (!this.currentTheme) return;

    this.currentTheme.overlayOpacity = opacity;
    this.applyOverlay(opacity);
    await ThemeStorage.save(this.currentTheme);
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Reset to default theme
   */
  async resetTheme(): Promise<void> {
    await ThemeStorage.reset();
    this.currentTheme = await ThemeStorage.load();
    this.applyTheme(this.currentTheme);
  }
}
