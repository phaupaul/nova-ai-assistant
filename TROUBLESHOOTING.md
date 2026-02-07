# Chrome Extension Troubleshooting Guide

## Installation Steps

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer Mode** (toggle switch in top-right corner)
3. **Click "Load unpacked"** button
4. **Select this project folder** (the folder containing manifest.json)
5. Extension should appear in the list

## Common Errors and Solutions

### Error: "Could not load manifest"
- **Check**: Make sure manifest.json exists and is valid JSON
- **Fix**: Use `manifest-simple.json` for basic testing

### Error: "Could not load icon"
- **Fix**: Icons are now optional in the current manifest

### Error: "Service worker failed to load"
- **Check**: background.js file exists and has no syntax errors
- **Fix**: Try removing background worker temporarily

### Error: Extension loads but popup doesn't open
- **Check**: popup.html exists and is valid HTML
- **Fix**: Right-click extension icon → "Inspect popup" to see console errors

## Testing the Extension

### Basic Test (Simple Version)
1. Rename `manifest.json` to `manifest-full.json`
2. Rename `manifest-simple.json` to `manifest.json`
3. Try loading the extension
4. If it works, the issue is in the full version

### Full Version Test
1. Load the full extension
2. Click the extension icon in toolbar
3. Try the "Test Extension" button
4. Check browser console for errors (F12)

## Debug Information

If extension still doesn't work, please provide:
1. **Exact error message** from Chrome
2. **Chrome version** (chrome://version/)
3. **Console errors** (F12 → Console tab)
4. **Which step fails** (loading vs popup vs functionality)

## Quick Fixes

### Reset to Working State
```bash
cp manifest-backup.json manifest.json
```

### Test Minimal Extension
```bash
cp manifest-simple.json manifest.json
```

### Check File Permissions
```bash
chmod 644 *.js *.html *.css *.json
```