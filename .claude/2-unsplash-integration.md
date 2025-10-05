# Unsplash Integration - Feature Documentation

## Overview

Integrated Unsplash API to allow users to browse, search, and download beautiful high-quality images directly within the Chrome extension. All images are saved locally as base64 for offline access.

## Features Implemented

### 1. **Unsplash API Integration**
- Search photos by keyword
- Load random photos
- Download and save images locally (base64)
- Automatic photographer attribution
- Proper API tracking (download location endpoint)

**Location**: `src/index.ts` - `UnsplashAPI` class (lines 136-198)

**Endpoints Used**:
- `/search/photos` - Search by query
- `/photos/random` - Get random photos
- `/download_location` - Track downloads (required by Unsplash)

**API Key Setup**:
- User must add their own Unsplash API key at line 138
- Free tier: 50 requests/hour (demo mode)
- Production tier: 5000 requests/hour (requires application)

### 2. **Browse Unsplash Modal**
- Full-screen modal with search functionality
- Grid layout of photo thumbnails
- Search bar with Enter key support
- Random photo button
- Click to select and download
- Photographer attribution on hover

**UI Components**:
- Modal overlay with frosted glass design
- Search input + 2 buttons (Search, Random)
- Responsive grid (250px min columns, 2 columns on mobile)
- Loading states and error messages

**Location**: `src/index.ts` - Methods:
- `showUnsplashModal()` - Lines 757-825
- `searchUnsplash()` - Lines 650-668
- `loadRandomUnsplash()` - Lines 670-688
- `renderUnsplashPhoto()` - Lines 690-707

### 3. **Local Storage System**
- All selected images saved as base64 in `chrome.storage.local`
- Prevents duplicate saves (checks by image ID)
- Works 100% offline after download
- No size limits (uses `unlimitedStorage` permission)

**Storage Structure**:
```typescript
{
  unsplashImages: [
    {
      id: "unsplash-{unsplashId}",
      url: "data:image/jpeg;base64,...",
      name: "Photo by {photographer}",
      photographer: "Photographer Name",
      photographerUrl: "https://unsplash.com/@username",
      position: "center" // or custom position
    }
  ]
}
```

**Location**: `src/index.ts` - `ThemeStorage` class methods:
- `saveUnsplashImage()` - Lines 256-270
- `getUnsplashImages()` - Lines 272-280
- `deleteUnsplashImage()` - Lines 282-291

### 4. **Image Position Adjuster**
- Interactive tool to reposition background images
- Drag-and-drop positioning
- 9 preset positions (center, top, bottom, left, right, corners)
- Live preview
- Works for both Unsplash and custom images

**Features**:
- Click and drag to position
- Visual crosshair indicator
- Preset buttons for quick positioning
- Saves position to image metadata
- Updates `background-position` CSS property

**Location**: `src/index.ts` - `showPositionAdjuster()` method (lines 832-932)

**UI Elements**:
- Preview window (16:9 aspect ratio)
- 9 preset buttons (3x3 grid on desktop, 2x2 on mobile)
- Save/Cancel actions
- Draggable positioning with percentage calculation

### 5. **Delete Functionality**
- Delete button (×) appears on hover for saved images
- Confirmation dialog before deletion
- Auto-switches to default background if deleted image was active
- Removes from local storage

**Location**: `src/index.ts`:
- Delete button rendering: Lines 531-542
- `deleteUnsplashImage()` method: Lines 637-648

### 6. **Photographer Attribution**
- Automatic attribution badge on saved images
- Shows photographer name
- Appears on hover
- Complies with Unsplash API guidelines

**Location**: `src/index.ts` - Lines 544-550

### 7. **Chrome Storage Migration**
- Migrated from `chrome.storage.sync` to `chrome.storage.local`
- Sync storage has 8KB limit per item (too small for base64 images)
- Local storage has no practical limit with `unlimitedStorage`
- Auto-migration for existing users

**Changes**:
- `ThemeStorage.load()` - Checks local first, migrates from sync if found
- `ThemeStorage.save()` - Uses local storage
- `ThemeStorage.onChange()` - Listens to local storage changes

## File Changes

### **manifest.json**
Added permissions:
```json
{
  "permissions": ["storage", "unlimitedStorage"],
  "host_permissions": [
    "https://api.unsplash.com/*",
    "https://images.unsplash.com/*"
  ]
}
```

### **index.html**
Added buttons in Background section:
- `#browseUnsplash` - Opens Unsplash modal
- `#adjustPosition` - Opens position adjuster
- `#addCustomBg` - Upload custom images (existing)

### **styles.css**
New CSS classes:
- `.unsplash-modal` - Modal overlay and content
- `.unsplash-search-bar` - Search input and buttons
- `.unsplash-results` - Photo grid
- `.unsplash-photo` - Individual photo cards
- `.unsplash-attribution` - Photographer credit
- `.delete-bg-btn` - Delete button for saved images
- `.photo-credit` - Attribution badge on thumbnails
- `.position-adjuster-overlay` - Position adjustment UI
- `.position-preview` - Draggable preview window
- `.position-presets` - Quick position buttons

### **index.ts**
New interfaces:
- `UnsplashPhoto` - API response structure
- Updated `BackgroundImage` - Added `position` field

New classes/methods:
- `UnsplashAPI` class (3 static methods)
- `ThemeStorage` - 2 new methods for Unsplash images
- `App` - 7 new methods for Unsplash features

## UI/UX Improvements

### **Responsive Design**
- Desktop: 4-5 columns in photo grid
- Mobile: 2 columns in photo grid
- Full-screen modal on mobile (no border radius)
- Stacked search buttons on mobile

### **Loading States**
- "Searching Unsplash..." message during search
- "Loading random photos..." during random load
- "Downloading..." indicator on selected photo
- Disabled click during download

### **Error Handling**
- "No images found" message for empty results
- "Failed to load images" for API errors
- "Failed to download image" alert on download failure
- Console error logging for debugging

### **Performance**
- Images stored as base64 (offline access)
- Grid uses `minmax(200px, 1fr)` for fluid layout
- `aspect-ratio` CSS for consistent sizing
- Lazy rendering (only render when modal opens)

## User Workflow

### **Browse and Select Unsplash Image**
1. Open settings panel
2. Click "Browse Unsplash" button
3. Either:
   - Click "Random" for random photos, OR
   - Type search query and click "Search" or press Enter
4. Click desired photo
5. Wait for download (shows "Downloading...")
6. Image saved and set as background
7. Modal closes automatically

### **Adjust Image Position**
1. Open settings panel
2. Click "Adjust Image Position"
3. Either:
   - Click preset button (Center, Top, Bottom, etc.), OR
   - Click and drag on preview to position manually
4. Click "Save" to apply
5. Background updates with new position

### **Delete Saved Image**
1. Open settings panel
2. Hover over saved Unsplash image
3. Click red "×" button in top-right
4. Confirm deletion
5. Image removed from storage and UI

## Technical Notes

### **Storage Quota**
- Base64 images are ~500KB - 2MB each
- `chrome.storage.local` default quota: 5MB
- With `unlimitedStorage`: Limited only by disk space
- Recommend limiting to 20-30 saved images

### **API Rate Limits**
- Demo mode: 50 requests/hour
- Each search = 1 request
- Each random load = 1 request
- Image downloads don't count against limit
- Consider caching search results in future

### **Image Quality**
- Using `regular` size from Unsplash (~1080px width)
- Good balance between quality and file size
- Could add quality selector in future (small/regular/full)

### **Offline Functionality**
✅ **Works Offline**:
- All saved images (base64 in local storage)
- Theme settings
- Position adjustments

❌ **Requires Online**:
- Browsing/searching new images
- Initial download of images

### **Browser Compatibility**
- Chrome/Edge: Full support
- Firefox: Should work (uses standard APIs)
- Safari: Not tested (different extension API)

## Future Enhancements

### **Potential Features**
- [ ] Image quality selector (small/regular/full/raw)
- [ ] Collections browsing
- [ ] Favorite/like images
- [ ] Image categories/tags
- [ ] Pagination (load more results)
- [ ] Export/import saved images
- [ ] Bulk delete
- [ ] Image compression options
- [ ] Slideshow mode (rotate backgrounds)
- [ ] Time-based background switching

### **Performance Improvements**
- [ ] Lazy load images in modal (virtualized list)
- [ ] Cache search results (avoid duplicate API calls)
- [ ] Compress base64 images (WebP format)
- [ ] Thumbnail previews vs full images
- [ ] IndexedDB for larger storage

### **UX Improvements**
- [ ] Keyboard navigation in modal
- [ ] Image preview on hover
- [ ] Undo delete
- [ ] Drag-to-reorder saved images
- [ ] Image metadata display (dimensions, photographer bio)

## Troubleshooting

### **"Resource::kQuotaBytesPerItem quota exceeded"**
✅ **Fixed** - Migrated to `chrome.storage.local` with `unlimitedStorage` permission

### **Images overlapping in modal**
✅ **Fixed** - Added proper grid sizing with `grid-auto-rows` and `min-height`

### **Modal broken on small screens**
✅ **Fixed** - Full-screen on mobile, 2-column grid, stacked buttons

### **Can't find Adjust Position button**
✅ **Fixed** - Moved to Background section at top (no scrolling needed)

## Attribution Requirements

As per Unsplash API Guidelines:
- ✅ Photographer name displayed on saved images
- ✅ "Images from Unsplash" link in modal footer
- ✅ Download tracking endpoint called
- ✅ Attribution preserved when images are used

## Code Quality

### **TypeScript**
- Full type safety with interfaces
- No `any` types used
- Proper async/await error handling
- Consistent naming conventions

### **Error Handling**
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks (return empty arrays, default values)

### **Code Organization**
- Separate class for API (`UnsplashAPI`)
- Storage methods in `ThemeStorage`
- UI methods in `App`
- Single-file architecture (no modules)

---

## Summary

Successfully integrated Unsplash API with:
- ✅ Search and browse functionality
- ✅ Offline storage (base64)
- ✅ Image position adjustment
- ✅ Delete functionality
- ✅ Photographer attribution
- ✅ Responsive design
- ✅ Error handling
- ✅ Storage migration to local

**Total Lines Added**: ~500 lines
**Files Modified**: 3 (manifest.json, index.html, styles.css, index.ts)
**New Classes**: 1 (UnsplashAPI)
**New Methods**: 12+
**API Key Required**: Yes (user must add their own)

---

*Last Updated: 2025-10-05*
*Status: ✅ Fully Functional*
