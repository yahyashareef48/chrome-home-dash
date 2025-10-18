import type { Shortcut } from "../types/index.js";
import { ThemeStorage } from "../services/storage.js";

// Shortcuts Manager
export class ShortcutsManager {
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

      // Add click handler to open URL
      item.addEventListener("click", () => {
        window.open(shortcut.url, "_blank");
      });

      // Right click context menu
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.showContextMenu(e, shortcut);
      });

      item.appendChild(icon);
      item.appendChild(name);
      this.gridElement?.appendChild(item);
    });
  }

  private showContextMenu(e: MouseEvent, shortcut: Shortcut): void {
    // Remove any existing context menu
    const existingMenu = document.querySelector(".shortcut-context-menu");
    if (existingMenu) existingMenu.remove();

    // Create context menu
    const menu = document.createElement("div");
    menu.className = "shortcut-context-menu";

    // Edit option
    const editOption = document.createElement("div");
    editOption.className = "context-menu-item";
    editOption.textContent = "Edit";
    editOption.addEventListener("click", () => {
      this.editShortcut(shortcut);
      menu.remove();
    });

    // Delete option
    const deleteOption = document.createElement("div");
    deleteOption.className = "context-menu-item";
    deleteOption.textContent = "Delete";
    deleteOption.style.color = "#ff4757";
    deleteOption.addEventListener("click", () => {
      this.deleteShortcut(shortcut.id);
      menu.remove();
    });

    menu.appendChild(editOption);
    menu.appendChild(deleteOption);
    document.body.appendChild(menu);

    // Position menu (adjust if it goes off screen)
    const menuRect = menu.getBoundingClientRect();
    let left = e.clientX;
    let top = e.clientY;

    // Adjust if menu goes below viewport
    if (top + menuRect.height > window.innerHeight) {
      top = e.clientY - menuRect.height;
    }

    // Adjust if menu goes right of viewport
    if (left + menuRect.width > window.innerWidth) {
      left = e.clientX - menuRect.width;
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    // Close menu when clicking elsewhere
    const closeMenu = (event: MouseEvent) => {
      if (!menu.contains(event.target as Node)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);
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
