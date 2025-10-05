# Chrome Home Dash - Memory Bank

## Project Overview

A beautiful iOS-inspired Chrome extension that replaces the new tab page with a customizable dashboard featuring stunning backgrounds, frosted glass UI elements, and theme customization.

## Tech Stack

- **TypeScript** - All logic and type safety
- **Chrome Extension Manifest V3** - Modern extension architecture
- **HTML/CSS** - UI structure and styling
- **Chrome Storage API** - Persistent theme settings

## Project Structure

```
chrome-home-dash/
├── .claude/
│   └── memory-bank.md          # This file - project documentation
├── src/
│   ├── index.ts                # Main app logic (all-in-one file, no modules)
│   ├── script.ts               # (Old modular version - not used)
│   ├── types.ts                # (Old modular version - not used)
│   ├── storage.ts              # (Old modular version - not used)
│   └── themeManager.ts         # (Old modular version - not used)
├── public/
│   ├── index.html              # Main HTML structure
│   ├── styles.css              # All styling with frosted glass effects
│   ├── manifest.json           # Extension configuration
│   ├── 1.jpg                   # Default background image
│   ├── 2.jpg                   # Background option 2
│   └── 3.jpg                   # Background option 3
├── dist/                       # Build output (load this in Chrome)
├── package.json
└── tsconfig.json
```

## Key Features

### 🎨 Visual Design
- **Frosted Glass UI** - All elements use `backdrop-filter: blur()` for glassmorphism
- **iOS-Inspired** - Clean, minimal design matching Apple's design language
- **Smooth Animations** - Cubic-bezier easing for natural motion
- **Responsive** - Works on all screen sizes

### 🖼️ Background System
- 3 pre-loaded beautiful images (Earth, Mountains, Viaduct)
- Default: `1.jpg` (Earth from Space)
- Custom image upload support (stored as base64 in Chrome storage)
- Blur intensity control (0-100)
- Overlay opacity control (0-100)
- **Default Settings**: Blur = 0, Overlay = 0 (no blur/overlay by default)

### 🎨 Theme Presets
1. **Light** - Bright iOS theme
2. **Dark** - Default dark theme (set on first load)
3. **Ocean** - Blue ocean-inspired colors
4. **Sunset** - Warm sunset colors

Each preset includes:
- Primary color
- Secondary color
- Accent color
- Background color (with transparency)
- Text color
- Secondary text color

### 🕐 Clock Widget
- Live time display (HH:MM format, 24-hour)
- Full date display (Weekday, Month Day, Year)
- Frosted glass background
- Hover scale effect
- Auto-updates every second

### ⚙️ Settings Panel
- Slide-in from right (iOS style)
- Frosted glass background
- Sections:
  - **Background**: Grid of image options + custom upload
  - **Theme**: Grid of color presets
  - **Appearance**: Blur and overlay sliders
  - **Reset**: Reset to default with confirmation

### 💾 Persistence
- Uses `chrome.storage.sync` API
- Settings sync across devices
- Automatic save on every change
- Default theme loads if no settings exist

## Technical Implementation

### TypeScript Configuration
- **Target**: ES2020
- **Module**: None (no ES6 modules to avoid browser compatibility issues)
- **Single File Build**: All code in `src/index.ts` compiled to `dist/index.js`
- **No Module Imports**: Everything in one file to avoid "Cannot use import statement outside a module" errors

### Build Process
```bash
npm run build
# Runs: tsc && xcopy /E /I /Y public dist
# Compiles TypeScript and copies public files to dist/
```

### Key Classes

#### `ThemeStorage`
- Static methods for Chrome storage operations
- `load()` - Load theme config
- `save()` - Save theme config
- `reset()` - Clear saved settings
- `onChange()` - Listen for storage changes

#### `ThemeManager`
- Manages theme application and updates
- `init()` - Initialize and load saved theme
- `applyTheme()` - Apply complete theme
- `updateBackground()` - Change background image
- `updateColors()` - Change color scheme
- `updateBlur()` - Adjust blur intensity
- `updateOverlay()` - Adjust overlay opacity
- `resetTheme()` - Reset to defaults

#### `App`
- Main application controller
- Clock management (updates every 1 second)
- Settings panel toggle
- UI rendering (backgrounds, theme presets)
- Event handlers for all user interactions
- File upload for custom backgrounds

### CSS Architecture

#### CSS Variables
```css
--color-primary
--color-secondary
--color-accent
--color-background
--color-text
--color-text-secondary
--shadow-sm/md/lg
--radius-sm/md/lg
--transition-smooth
--transition-spring
```

#### Frosted Glass Formula
```css
backdrop-filter: blur(40px) saturate(180%);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.18);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

### Data Structures

#### ThemeConfig Interface
```typescript
{
  backgroundImage: BackgroundImage;
  colorScheme: ColorScheme;
  useCustomColors: boolean;
  presetId?: string;
  blurIntensity: number;      // 0-100
  overlayOpacity: number;     // 0-100
}
```

#### BackgroundImage Interface
```typescript
{
  id: string;
  url: string;
  name: string;
  isCustom: boolean;
}
```

#### ColorScheme Interface
```typescript
{
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
}
```

## Default Configuration

```typescript
DEFAULT_THEME = {
  backgroundImage: DEFAULT_IMAGES[0],  // 1.jpg
  colorScheme: THEME_PRESETS[1].colors, // Dark theme
  useCustomColors: false,
  presetId: 'dark',
  blurIntensity: 0,
  overlayOpacity: 0
}
```

## Installation Instructions

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

3. Open a new tab to see the extension

## User Features

### Background Customization
1. Click settings gear (bottom right)
2. Select from 3 default images OR
3. Click "Add Custom Image" to upload your own
4. Adjust blur intensity (0 = sharp, 100 = very blurry)
5. Adjust overlay opacity (0 = transparent, 100 = dark)

### Theme Customization
1. Open settings panel
2. Choose from 4 presets: Light, Dark, Ocean, Sunset
3. Theme applies instantly with smooth transitions
4. Changes persist across browser restarts

### Reset Settings
1. Click "Reset to Default" button
2. Confirm the reset
3. Returns to: 1.jpg background, Dark theme, 0 blur, 0 overlay

## Known Issues & Solutions

### ✅ SOLVED: Module Import Errors
- **Problem**: "Cannot use import statement outside a module"
- **Solution**: Moved from modular TypeScript to single-file architecture
- All code now in `src/index.ts` with no imports/exports
- Compiles to plain JavaScript that works in browser

### ✅ SOLVED: Reset Not Working
- **Problem**: Reset button didn't update UI properly
- **Solution**: Added proper re-render calls after reset
- Order: resetTheme() → renderBackgrounds() → renderThemePresets() → loadCurrentTheme()
- Added confirmation dialog for safety

### ✅ SOLVED: Default Blur/Overlay
- **Problem**: Had 20/30 blur/overlay by default (too much)
- **Solution**: Changed defaults to 0/0 for clean look
- Updated both TypeScript defaults and HTML input values

## Design Principles

1. **Non-intrusive** - Enhances Chrome, doesn't replace existing features
2. **Performance** - Lightweight, no external dependencies
3. **Beautiful** - iOS-inspired frosted glass aesthetic
4. **Customizable** - User controls all visual aspects
5. **Persistent** - Settings saved and synced
6. **Smooth** - All interactions have polished animations

## Future Enhancement Ideas

- [ ] More theme presets
- [ ] Image gallery/unsplash integration
- [ ] Custom color picker (not just presets)
- [ ] Widgets: weather, quick links, search bar
- [ ] Keyboard shortcuts
- [ ] Import/export settings
- [ ] Animation speed controls
- [ ] Multiple clock styles
- [ ] Background slideshow/rotation

## Development Commands

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch
```

## Important Notes

⚠️ **Always use `dist/` folder when loading extension in Chrome**
⚠️ **Don't use ES6 modules** - causes browser compatibility issues
⚠️ **Blur/Overlay defaults are 0** - clean sharp look by default
⚠️ **Default background is 1.jpg** - Earth from Space
⚠️ **Default theme is Dark** - matches most user preferences

## File Locations

- **Main logic**: `src/index.ts`
- **Styles**: `public/styles.css`
- **HTML**: `public/index.html`
- **Manifest**: `public/manifest.json`
- **Build output**: `dist/` (this is what Chrome loads)
- **Images**: `public/1.jpg`, `public/2.jpg`, `public/3.jpg`

---

*Last Updated: 2025-10-05*
*Project Status: ✅ Fully Functional*
