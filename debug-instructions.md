# Debugging Instructions - Updated

## Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "News Highlights"
3. Click the **Reload** button (circular arrow icon)

## Step 2: Open Page Console (IMPORTANT!)

1. Go to **any webpage** (e.g., Google News, Wikipedia, etc.)
2. **Right-click on the page** and select **"Inspect"** OR press **F12**
3. Go to the **Console tab**
4. Keep this console open

You should immediately see:
```
News Highlights content script loaded
Setting up event listeners
Document already loaded, creating save button immediately
Save button created: <div id="news-highlights-save-btn">
```

## Step 3: Test Text Selection

1. **Select some text** on the page
2. Watch the console - you should see:
```
Text selected: <your text>...
Save button positioned at: X Y
```

3. You should see a blue "Save Highlight" button appear near your selection

## Step 4: Click Save Button

1. Click the "Save Highlight" button
2. Watch the console - you should see:
```
handleSaveHighlight called
Selected text: <your text>
Created item: {id: "pref_...", value: "...", ...}
```

3. A dialog should appear

## Step 5: Save in Dialog

1. Type some collections (e.g., "Test, News")
2. Click "Save" button
3. Watch the console - you should see:
```
Save button clicked in dialog
Collections: ["Test", "News"]
Calling saveItem with: {...}
saveItem called with: {...}
saveItem response: {success: true}
Item saved successfully
```

## Step 6: Check Background Console

1. Go to `chrome://extensions/`
2. Click on **"service worker"** link under News Highlights
3. Check the console - you should see:
```
Background received message: saveItem
Saving item: {...}
Current profile before save: {...}
Profile saved. Total items: X
```

## Step 7: Check Popup

1. Click the extension icon
2. Right-click in popup and select "Inspect"
3. Check the console - you should see:
```
getItems response: {items: Array(X)}
displayItems called. allItems: X filteredItems: X
```

## If Nothing Appears in Page Console

The content script might not be loading. Try:
1. Hard refresh the page: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Check if the content script is listed under the extension in `chrome://extensions/`

## Step 5: Manually Check Storage

In either the popup or background console, run:

```javascript
chrome.storage.local.get(['hspProfile'], (data) => {
  console.log('Storage data:', data);
  console.log('Total items:', data.hspProfile?.content?.preferences?.items?.length);
  console.log('Items:', data.hspProfile?.content?.preferences?.items);
});
```

This will show you exactly what's stored.

## Common Issues

### Issue: Response is undefined
- The message passing might not be working
- Check if you see errors in the background worker console

### Issue: Items array is empty
- Check if the save is actually completing
- Look for errors during save operation

### Issue: Empty state showing despite having items
- Check the console logs in popup
- Verify filteredItems is being populated

## Quick Fix: Reset Everything

If nothing works, run this in the background console to reset:

```javascript
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  chrome.runtime.reload();
});
```

Then test saving a new highlight.
