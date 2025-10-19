# Notes Feature

## Overview
Google Keep-style notes with markdown support added to the right panel.

## Files Created
- `src/managers/notes-manager.ts` - Notes CRUD operations
- `public/libs/marked.js` - Markdown parser (from npm)
- `public/libs/purify.js` - HTML sanitizer (from npm)

## Files Modified
- `src/types/index.ts` - Added Note interface
- `src/app.ts` - Integrated notes functionality
- `public/index.html` - Added notes UI and modal
- `public/styles/notes.css` - Updated with full notes styling
- `src/services/storage.ts` - Added notes storage methods

## Features

### Notes Panel (Right Side)
- **Expandable Input**: Click "Take a note..." to expand title/content fields
- **Notes Grid**: Masonry-style grid displaying all notes
- **Markdown Support**: Full markdown rendering in notes
- **Timestamps**: Shows when notes were last updated
- **Delete on Hover**: Delete button appears on note card hover

### Note Modal
- **View Tab** (default): Clean, full-width rendered markdown view
- **Edit Tab**: Split view with editor + live preview
- **Header**: Shows note title
- **Footer**: View/Edit tabs on left, Delete/Close/Save buttons on right
- **Save Behavior**: Switches back to View tab after saving

## Key Components

### NotesManager
- `addNote(title, content)` - Create new note
- `updateNote(id, title, content)` - Update existing note
- `deleteNote(id)` - Remove note
- `getNotes()` - Get all notes sorted by updatedAt

### Markdown Libraries
- **marked.js**: Converts markdown to HTML
- **DOMPurify**: Sanitizes HTML for XSS protection
- Loaded from `public/libs/` (local copies from npm packages)

## Usage
1. Click "Take a note..." input
2. Enter title and content (supports markdown)
3. Click Save - note appears in grid
4. Click any note to view in modal
5. Click Edit tab to modify
6. Hover over note cards to delete
