// Theme Types and Interfaces

export interface BackgroundImage {
  id: string;
  url: string;
  name: string;
  isCustom: boolean;
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
  blurIntensity: number; // 0-100
  overlayOpacity: number; // 0-100
}

export const DEFAULT_IMAGES: BackgroundImage[] = [
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

export const THEME_PRESETS: ThemePreset[] = [
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

export const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: DEFAULT_IMAGES[0],
  colorScheme: THEME_PRESETS[1].colors, // Dark theme by default
  useCustomColors: false,
  presetId: 'dark',
  blurIntensity: 20,
  overlayOpacity: 30,
};
