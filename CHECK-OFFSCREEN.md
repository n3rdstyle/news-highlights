# How to Check Offscreen Document Console

1. Open Chrome DevTools (F12)
2. In DevTools, open the **Console** tab
3. At the top of the console, there's a dropdown that says "top"
4. Click the dropdown
5. You should see an entry for the offscreen document
6. Select it to view its console

OR

Try this approach:
1. Go to chrome://inspect/#pages
2. Look for "offscreen.html" in the list
3. Click "inspect" next to it

This will show you the offscreen document's console which should have logs like:
- "Offscreen document loaded"
- "window.ai available: true" or "false"
- "Checking AI availability..."
- etc.

