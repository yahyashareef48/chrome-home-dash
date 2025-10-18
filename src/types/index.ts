// Types and Interfaces

export interface BackgroundImage {
  id: string;
  url: string;
  name: string;
  isCustom: boolean;
  photographer?: string;
  photographerUrl?: string;
  position?: string; // CSS background-position value (e.g., "center", "top", "50% 30%")
}

export interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string; // URL to favicon or custom icon
}

export interface UnsplashPhoto {
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

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: ColorScheme;
}

export interface ThemeConfig {
  backgroundImage: BackgroundImage;
  colorScheme: ColorScheme;
  useCustomColors: boolean;
  presetId?: string;
  blurIntensity: number;
  overlayOpacity: number;
}
