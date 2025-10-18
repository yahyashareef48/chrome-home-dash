import type { BackgroundImage, Shortcut, ThemePreset, ThemeConfig } from "../types/index.js";

export const DEFAULT_IMAGES: BackgroundImage[] = [
  {
    id: "bg-1",
    url: "2.jpg",
    name: "Mountain Range",
    isCustom: false,
  },
  {
    id: "bg-2",
    url: "a1148127791_10.jpg",
    name: "Deer at Night",
    isCustom: false,
  },
  {
    id: "bg-3",
    url: "1.jpg",
    name: "Earth from Space",
    isCustom: false,
  },
];

export const THEME_PRESETS: ThemePreset[] = [
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

export const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: DEFAULT_IMAGES[0],
  colorScheme: THEME_PRESETS[1].colors,
  useCustomColors: false,
  presetId: "dark",
  blurIntensity: 0,
  overlayOpacity: 0,
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
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
