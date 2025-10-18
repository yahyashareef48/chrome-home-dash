import type { BackgroundImage, UnsplashPhoto } from "./types/index.js";
import { DEFAULT_IMAGES, THEME_PRESETS } from "./constants/index.js";
import { ThemeManager } from "./managers/theme-manager.js";
import { ShortcutsManager } from "./managers/shortcuts-manager.js";
import { ThemeStorage } from "./services/storage.js";
import { UnsplashAPI } from "./services/unsplash-api.js";

// Main App
export class App {
  private themeManager: ThemeManager;
  private shortcutsManager: ShortcutsManager;
  private settingsPanel: HTMLElement | null;
  private isSettingsOpen = false;
  private unsplashImages: BackgroundImage[] = [];
  private customImages: BackgroundImage[] = [];
  private isLoadingUnsplash = false;
  private isSearchActive = false;

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
    this.setupSearch();
    this.renderBackgrounds();
    this.renderThemePresets();
    this.loadCurrentTheme();
  }

  setupSearch() {
    const searchBtn = document.getElementById("searchBtn");
    const searchContainer = document.getElementById("searchBarContainer");
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const island = document.getElementById("shortcutsIsland");

    searchBtn?.addEventListener("click", () => {
      this.isSearchActive = !this.isSearchActive;
      searchContainer?.classList.toggle("active", this.isSearchActive);
      searchBtn.classList.toggle("active", this.isSearchActive);
      island?.classList.toggle("search-active", this.isSearchActive);

      if (this.isSearchActive && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          this.performSearch(query);
          searchInput.value = "";
          this.closeSearch();
        }
      } else if (e.key === "Escape") {
        this.closeSearch();
      }
    });

    // Close search when clicking outside
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        this.isSearchActive &&
        !searchContainer?.contains(target) &&
        !searchBtn?.contains(target)
      ) {
        this.closeSearch();
      }
    });
  }

  performSearch(query: string) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, "_blank");
  }

  closeSearch() {
    const searchContainer = document.getElementById("searchBarContainer");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const island = document.getElementById("shortcutsIsland");

    this.isSearchActive = false;
    searchContainer?.classList.remove("active");
    searchBtn?.classList.remove("active");
    island?.classList.remove("search-active");
    if (searchInput) searchInput.value = "";
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
