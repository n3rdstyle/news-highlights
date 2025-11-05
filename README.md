# News Highlights

A Chrome browser extension that allows you to highlight and save text snippets from any webpage. All highlights are saved locally in the HSP (Human Standard Profile) format.

## Features

- **Easy Highlighting**: Simply select text on any webpage and click "Save Highlight"
- **AI Smart Collections**: Automatically cluster highlights into meaningful collections using Gemini Nano (Chrome's built-in AI)
- **Notes**: Add personal notes to each highlight for context and insights
- **HSP Format**: All data is stored using the HSP 0.1 format specification
- **Collections/Tags**: Organize highlights with custom collections
- **Search & Filter**: Quickly find highlights by searching or filtering by collection
- **Export/Import**: Export your highlights as JSON and import them on another device
- **Source Tracking**: Every highlight includes the source URL
- **Privacy First**: All data is stored locally in your browser, AI runs on-device

## Installation

### Install from Files (Developer Mode)

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked"
5. Select the "News Highlights" folder
6. The extension is now installed and ready to use!

### Install from Chrome Web Store

*(Coming soon)*

## Usage

### Saving a Highlight

1. **Select text** on any webpage
2. Click the **"Save Highlight"** button that appears near your selection
   - Alternatively, right-click and select "Save as Highlight" from the context menu
3. Enter optional **collections/tags** (comma-separated) to organize your highlight
4. Click **"Save"**

### Viewing Highlights

1. Click the News Highlights extension icon in your browser toolbar
2. Browse all your saved highlights in the popup
3. Use the search bar to find specific highlights
4. Filter by collection using the dropdown menu

### Managing Highlights

Each highlight card has several actions:

- **Copy**: Copy the highlighted text to clipboard
- **Edit**: Edit the collections/tags
- **Delete**: Remove the highlight
- **Click source**: Opens the original webpage

### Exporting Data

1. Click the extension icon to open the popup
2. Click the **export button** (download icon) in the header
3. Your data will be downloaded as a JSON file in HSP format

### Importing Data

1. Click the extension icon to open the popup
2. Click the **import button** (upload icon) in the header
3. Select a previously exported JSON file
4. Your highlights will be imported

### AI Smart Collections (Gemini Nano)

Automatically organize your highlights into intelligent collections:

1. Save at least 3-5 highlights from different sources
2. Click the **AI Smart Collections button** (layers icon) in the header
3. Wait a few seconds for AI analysis
4. Review the suggested collections
5. Select which collections to apply
6. Click **"Apply All"**

**Requirements**: Chrome 127+, Gemini Nano enabled (see [AI-CLUSTERING.md](AI-CLUSTERING.md) for setup)

**How it works**: Gemini Nano analyzes your highlights on-device and groups them by semantic similarity, topics, and themes - completely private, no data leaves your computer!

## HSP Format

This extension stores data using the Human Standard Profile (HSP) format, version 0.1.

### Data Structure

Each highlight is stored as an item with the following properties:

```json
{
  "id": "pref_uniqueid123",
  "value": "The highlighted text content",
  "source_url": "https://example.com/article",
  "collections": ["Technology", "Research"],
  "assurance": "self_declared",
  "reliability": "high",
  "state": "default",
  "created_at": "2025-11-05T10:00:00.000Z",
  "updated_at": "2025-11-05T10:00:00.000Z"
}
```

### Full Profile Structure

```json
{
  "id": "profile_uniqueid",
  "hsp": "0.1",
  "type": "profile",
  "created_at": "2025-11-05T10:00:00.000Z",
  "updated_at": "2025-11-05T10:00:00.000Z",
  "content": {
    "basic": {
      "identity": {
        "name": {
          "assurance": "self_declared",
          "reliability": "high",
          "updated_at": "2025-11-05T10:00:00.000Z",
          "value": "News Highlights User"
        }
      }
    },
    "preferences": {
      "items": [
        // Array of highlight items
      ]
    }
  }
}
```

## Development

### Project Structure

```
News Highlights/
├── manifest.json          # Extension manifest
├── background.js          # Service worker for data management
├── content.js            # Content script for text selection
├── content.css           # Styles for content script
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── ai-clustering.js      # AI clustering with Gemini Nano
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md             # This file
└── AI-CLUSTERING.md      # AI feature documentation
```

### Key Components

1. **Content Script** (`content.js`, `content.css`)
   - Detects text selection on web pages
   - Shows "Save Highlight" button
   - Displays collection dialog
   - Sends data to background script

2. **Background Script** (`background.js`)
   - Manages data storage using Chrome Storage API
   - Maintains HSP format structure
   - Handles CRUD operations for highlights
   - Manages export/import functionality

3. **Popup** (`popup.html`, `popup.js`, `popup.css`)
   - Displays all saved highlights
   - Provides search and filter functionality
   - Handles edit and delete operations
   - Manages export/import UI

4. **AI Clustering** (`ai-clustering.js`)
   - Interfaces with Chrome's built-in AI (Gemini Nano)
   - Analyzes highlights for semantic similarity
   - Generates collection suggestions
   - Runs entirely on-device for privacy

### Storage

Data is stored using Chrome's `chrome.storage.local` API. The entire HSP profile is stored under the key `hspProfile`.

## Privacy

All your highlight data is stored locally in your browser. Nothing is sent to external servers. Your data remains private and under your control.

**AI Feature Privacy**: When using AI Smart Collections, all processing happens on your device using Chrome's built-in Gemini Nano model. Your highlights are never sent to any external server or cloud service. The AI runs completely offline (after initial model download).

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

If you encounter any issues or have suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ for better reading and research**
