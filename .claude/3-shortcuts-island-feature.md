# Shortcuts Island Feature

## Overview
A beautiful, compact shortcuts bar that sits at the bottom of the new tab page, allowing users to quickly access their favorite websites.

## Features

### 1. Shortcuts Grid
- **Display**: Shows website shortcuts with favicons and names
- **Layout**: Horizontal scrollable grid with no visible scrollbar
- **Interaction**: Click to open website in new tab
- **Fallback**: If favicon fails to load, displays first letter of site name in colored circle

### 2. Search Functionality
- **Search Button**: Opens an expandable search bar above the island
- **Search Bar**:
  - Appears above the shortcuts island when activated
  - Uses Google as the default search engine
  - Opens search results in a new tab
  - Auto-focuses input when opened
  - Closes on ESC key or clicking outside
- **Keyboard Shortcuts**: Press Enter to search, ESC to close

### 3. Add Shortcut Button
- **Function**: Opens a modal to add new shortcuts
- **Modal Fields**:
  - Name (required)
  - URL (required) - auto-adds `https://` if missing
  - Icon URL (optional)
- **Auto-fetch Favicon**: Uses Google's favicon service if no custom icon provided

### 4. Context Menu (Right-Click)
- **Edit**: Opens the shortcut in edit mode
- **Delete**: Removes the shortcut with confirmation
- **Smart Positioning**: Automatically adjusts position if menu would go off-screen

## Design

### Visual Style
- **Glassmorphic Design**: Blur backdrop with semi-transparent background
- **Border Radius**: 18px rounded corners on island container
- **Colors**:
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border: `rgba(255, 255, 255, 0.18)`
  - Hover: `rgba(255, 255, 255, 0.12)`

### Layout
- **Container**: Fixed position at bottom center of screen
- **Padding**: Zero padding on container, chips have individual padding
- **Gaps**: No gaps between elements for seamless look
- **Divider**: Vertical line separating shortcuts from action buttons

### Shortcuts Chips
- **Size**: 60px × 60px
- **Spacing**: 0.625rem padding per chip
- **Icon**: 36px × 36px
- **Text**: 0.65rem font size
- **Hover Effect**: Subtle background color change
- **Active Effect**: Scale down on click
- **Border Radius**: 0 (square blocks, clipped by container)

### Action Buttons (Search & Add)
- **Size**: Same as shortcut chips (60px × 60px)
- **Icons**: 22px × 22px SVG icons
- **Hover**: Same background effect as shortcuts
- **Active State**: Search button shows different background when search is open

## Technical Implementation

### Storage
- **Method**: Chrome local storage API
- **Key**: `shortcuts`
- **Default Shortcuts**:
  - Google (`https://www.google.com`)
  - YouTube (`https://www.youtube.com`)
  - Gmail (`https://mail.google.com`)
  - GitHub (`https://github.com`)

### Components

#### ShortcutsManager Class
- `init()`: Loads shortcuts and sets up event listeners
- `render()`: Renders shortcuts to the grid
- `showModal()`: Opens add/edit modal
- `hideModal()`: Closes modal
- `handleSubmit()`: Saves shortcut data
- `editShortcut()`: Opens shortcut in edit mode
- `deleteShortcut()`: Removes a shortcut
- `showContextMenu()`: Displays right-click menu
- `getFaviconUrl()`: Generates Google favicon URL

#### ThemeStorage Methods
- `getShortcuts()`: Retrieves shortcuts from storage
- `saveShortcuts()`: Saves shortcuts array
- `addShortcut()`: Adds a new shortcut
- `updateShortcut()`: Updates existing shortcut
- `deleteShortcut()`: Removes a shortcut by ID

### HTML Structure
```html
<div class="shortcuts-island">
  <div class="shortcuts-grid">
    <!-- Shortcut items -->
  </div>
  <div class="search-bar-container">
    <input class="search-input" />
  </div>
  <div class="island-actions">
    <button class="island-action-btn">Search</button>
    <button class="island-action-btn">Add</button>
  </div>
</div>
```

### CSS Key Classes
- `.shortcuts-island`: Main container
- `.shortcuts-grid`: Scrollable shortcuts container (left rounded corners)
- `.shortcut-item`: Individual shortcut chip
- `.search-bar-container`: Expandable search bar (absolutely positioned above)
- `.island-actions`: Action buttons container (right rounded corners)
- `.shortcut-context-menu`: Right-click context menu
- `.context-menu-item`: Menu options

## User Interactions

### Adding a Shortcut
1. Click the "+" button
2. Fill in name and URL (icon optional)
3. Click "Save"
4. Shortcut appears in the grid

### Editing a Shortcut
1. Right-click the shortcut
2. Select "Edit" from context menu
3. Modify fields in modal
4. Click "Save"

### Deleting a Shortcut
1. Right-click the shortcut
2. Select "Delete" from context menu
3. Confirm deletion

### Searching
1. Click the search button (magnifying glass)
2. Type search query
3. Press Enter
4. Opens Google search in new tab

## Responsive Design

### Mobile Adaptations
- Island width: Adjusts to screen with `max-width: 90vw`
- Shortcuts: Slightly smaller on mobile
- Search bar: Full width when active on mobile
- Scrollable: Horizontal scroll for many shortcuts

## Browser Compatibility
- Chrome/Edge (Manifest V3)
- Uses modern CSS features:
  - `backdrop-filter`
  - CSS Grid
  - Flexbox
  - CSS animations
  - Custom properties

## Future Enhancements (Potential)
- Drag-and-drop reordering
- Shortcut categories/folders
- Custom search engine selection
- Import/export shortcuts
- Sync across devices
- Keyboard navigation
- Custom themes for shortcuts island
