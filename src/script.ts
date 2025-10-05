import { ThemeManager } from './themeManager';
import { DEFAULT_IMAGES, THEME_PRESETS, BackgroundImage } from './types';

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
    // Initialize theme
    await this.themeManager.init();

    // Setup UI
    this.setupClock();
    this.setupSettings();
    this.renderBackgrounds();
    this.renderThemePresets();

    // Load current theme values into UI
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
