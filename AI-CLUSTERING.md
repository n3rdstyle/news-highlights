# AI Smart Collections with Gemini Nano

The News Highlights extension now includes an intelligent AI-powered feature that automatically clusters your highlights into meaningful collections using Google's Gemini Nano, which runs entirely on your device.

## What is Gemini Nano?

Gemini Nano is Google's smallest AI model that runs directly in Chrome, providing privacy-first AI capabilities without sending your data to any server. It's built into Chrome and powers features like the Prompt API.

## Features

- **Semantic Analysis**: Understands the meaning and context of your highlights, not just keywords
- **Smart Clustering**: Groups related highlights based on topics, themes, and subjects
- **Privacy-First**: All processing happens on your device - your data never leaves your computer
- **Customizable**: Review and select which suggested collections to apply
- **Multi-Collection**: Each highlight can belong to multiple collections

## Requirements

To use AI Smart Collections, you need:

1. **Chrome 127 or later** (Check: `chrome://version`)
2. **Gemini Nano model downloaded**
3. **Prompt API enabled**

### Setup Instructions

#### Step 1: Enable Prompt API

1. Open `chrome://flags/` in Chrome
2. Search for "Prompt API for Gemini Nano"
3. Set it to **"Enabled"**
4. Restart Chrome

#### Step 2: Download Gemini Nano

The model should download automatically, but you can check/force download:

1. Open `chrome://components/`
2. Look for **"Optimization Guide On Device Model"**
3. Click **"Check for update"** if version shows 0.0.0.0
4. Wait for download to complete (the model is ~1-2GB)

#### Step 3: Verify Setup

Open the browser console (F12) and run:
```javascript
(async () => {
  const status = await window.ai.languageModel.capabilities();
  console.log('Gemini Nano status:', status);
})();
```

You should see `available: "readily"` when setup is complete.

## How to Use

### Basic Usage

1. **Save at least 3-5 highlights** from various websites (the more highlights, the better the clustering)
2. Click the **AI Smart Collections button** (layers icon) in the extension popup header
3. Wait a few seconds while Gemini Nano analyzes your highlights
4. **Review the suggested collections** in the dialog that appears
5. **Select/deselect collections** using the checkboxes
6. Click **"Apply All"** to add the collections to your highlights

### What Happens Behind the Scenes

1. The extension sends your highlight text (up to 200 characters per highlight) to Gemini Nano
2. Gemini Nano analyzes semantic meaning, topics, and themes
3. It identifies 3-8 meaningful collections
4. Each highlight is assigned to the most relevant collection
5. You can review and approve the suggestions before applying

### Example Scenarios

**Scenario 1: Mixed News Reading**
- Highlights from tech, politics, and health articles
- AI creates: "Technology", "Politics", "Health & Wellness"

**Scenario 2: Research Project**
- Highlights about AI, machine learning, neural networks
- AI creates: "AI Fundamentals", "Deep Learning", "Neural Networks", "AI Applications"

**Scenario 3: Mixed Topics**
- Highlights from recipes, travel guides, and book reviews
- AI creates: "Cooking & Recipes", "Travel", "Literature"

## Tips for Best Results

1. **Have diverse content**: The more varied your highlights, the better the clustering
2. **Use descriptive highlights**: Full sentences work better than fragments
3. **Minimum 3 highlights**: AI needs at least 3 items to find patterns
4. **Review suggestions**: Always review before applying - AI isn't perfect!
5. **Iterate**: You can run AI clustering multiple times as you add more highlights

## Privacy & Security

- ✅ **100% On-Device**: Gemini Nano runs entirely on your device
- ✅ **No Network Requests**: Your highlights never leave your computer
- ✅ **No Tracking**: No data is collected or sent to Google
- ✅ **Offline Capable**: Works without an internet connection (after model download)

## Troubleshooting

### "AI Clustering is not available"

**Issue**: Gemini Nano is not available
- **Solution**: Follow the setup instructions above
- Check you're on Chrome 127+
- Ensure Prompt API flag is enabled
- Verify model is downloaded in chrome://components

### "Model needs to be downloaded"

**Issue**: Gemini Nano model not downloaded yet
- **Solution**:
  1. Go to `chrome://components/`
  2. Find "Optimization Guide On Device Model"
  3. Click "Check for update"
  4. Wait for ~1-2GB download to complete

### "Failed to parse AI response"

**Issue**: AI returned unexpected format
- **Solution**: Try again - sometimes the AI needs a retry
- Reduce number of highlights if you have many (try with 10-20 first)
- Check console for detailed error logs

### AI Suggests Unexpected Collections

**Issue**: Collections don't make sense
- **Possible causes**:
  - Not enough highlights (need 3-5 minimum)
  - Highlights are too similar (no diversity)
  - Highlights are too short (fragments vs sentences)
- **Solution**: Add more diverse highlights and try again

## Technical Details

### How It Works

1. **Text Preprocessing**: Highlights are truncated to 200 chars and formatted
2. **Prompt Engineering**: A carefully crafted prompt instructs Gemini Nano to:
   - Identify semantic themes
   - Group similar content
   - Generate descriptive collection names
   - Output structured JSON
3. **Response Parsing**: JSON is parsed and validated
4. **User Review**: Suggestions are presented for approval
5. **Batch Update**: Selected collections are applied to items in storage

### Model Parameters

- **Temperature**: 0.3 (lower = more focused, less creative)
- **Top-K**: 3 (considers top 3 most likely tokens)

These conservative settings ensure consistent, predictable clustering.

### Limitations

- **Input Limit**: Each highlight is limited to 200 characters in the prompt
- **Collection Limit**: Suggests 3-8 collections (optimal range)
- **Processing Time**: 5-15 seconds depending on number of highlights
- **Model Size**: Requires ~1-2GB disk space for Gemini Nano

## Future Enhancements

Potential features for future versions:
- Automatic re-clustering as new highlights are added
- Confidence scores for each clustering
- Multi-language support
- Custom clustering parameters (temperature, collection count)
- Suggested tags in addition to collections

## Feedback

The AI clustering feature is experimental. If you encounter issues or have suggestions:
- Check the browser console for detailed logs
- Note which highlights caused unexpected results
- Report issues with example data (anonymized if sensitive)

---

**Powered by Gemini Nano - Google's on-device AI**
