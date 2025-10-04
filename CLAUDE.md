# Chrome Home Dash

## Project Overview

A Chrome extension that enhances the new tab page by adding features on top of the user's existing configuration, without replacing their current theme settings.

## Goals

- Build a non-intrusive Chrome extension
- Preserve user's existing Chrome theme and configurations
- Add additional features to the new tab page
- Layer enhancements on top of existing settings rather than replacing them

## Tech Stack

- TypeScript
- Chrome Extension Manifest V3
- HTML/CSS

## Project Structure

```
chrome-home-dash/
├── src/              # TypeScript source files
├── public/           # Static assets (HTML, CSS, manifest)
├── dist/             # Built files (load this in Chrome)
├── package.json
└── tsconfig.json
```

## Development

- `npm run build` - Build the extension
- `npm run watch` - Watch for changes and rebuild

## Installation

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Current Status

- ✅ Basic TypeScript setup
- ✅ Build pipeline configured
- 🔄 Hello World placeholder
- ⏳ Feature implementation pending
