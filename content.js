// Content script for handling text selection and saving highlights
console.log('News Highlights content script loaded');

let saveButton = null;

// Create the save button element
function createSaveButton() {
  const button = document.createElement('div');
  button.id = 'news-highlights-save-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2h10a1 1 0 0 1 1 1v12l-6-3-6 3V3a1 1 0 0 1 1-1z" fill="currentColor"/>
    </svg>
    <span>Save Highlight</span>
  `;
  button.style.cssText = `
    position: absolute;
    display: none;
    z-index: 999999;
  `;
  document.body.appendChild(button);

  button.addEventListener('click', handleSaveHighlight);

  return button;
}

// Handle text selection
function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    console.log('Text selected:', selectedText.substring(0, 50) + '...');
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the button near the selection
    if (saveButton) {
      saveButton.style.display = 'flex';
      saveButton.style.left = `${rect.left + window.scrollX}px`;
      saveButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
      console.log('Save button positioned at:', rect.left, rect.bottom);
    } else {
      console.warn('saveButton is null');
    }
  } else {
    if (saveButton) {
      saveButton.style.display = 'none';
    }
  }
}

// Handle saving the highlight
function handleSaveHighlight(e) {
  console.log('handleSaveHighlight called');
  e.preventDefault();
  e.stopPropagation();

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  console.log('Selected text:', selectedText);

  if (selectedText.length === 0) {
    console.log('No text selected');
    return;
  }

  // Create HSP format item
  const item = {
    id: `pref_${generateId()}`,
    value: selectedText,
    source_url: window.location.href,
    collections: [],
    notes: '',
    assurance: 'self_declared',
    reliability: 'high',
    state: 'default',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Created item:', item);

  // Show collection selection dialog
  showCollectionDialog(item);
}

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Show dialog for selecting collections/tags
function showCollectionDialog(item) {
  const dialog = document.createElement('div');
  dialog.id = 'news-highlights-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>Save Highlight</h3>
      <div class="preview">${truncateText(item.value, 150)}</div>
      <div class="source">From: ${new URL(item.source_url).hostname}</div>
      <div class="form-group">
        <label for="collections-input">Collections (comma-separated):</label>
        <input type="text" id="collections-input" placeholder="e.g., Technology, News, Research" />
      </div>
      <div class="form-actions">
        <button id="cancel-btn" class="btn-secondary">Cancel</button>
        <button id="save-btn" class="btn-primary">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Focus on input
  setTimeout(() => {
    document.getElementById('collections-input').focus();
  }, 100);

  // Handle save
  document.getElementById('save-btn').addEventListener('click', () => {
    console.log('Save button clicked in dialog');
    const collectionsInput = document.getElementById('collections-input').value;
    item.collections = collectionsInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    console.log('Collections:', item.collections);
    console.log('Calling saveItem with:', item);

    saveItem(item);
    dialog.remove();
    if (saveButton) saveButton.style.display = 'none';
    window.getSelection().removeAllRanges();
  });

  // Handle cancel
  document.getElementById('cancel-btn').addEventListener('click', () => {
    dialog.remove();
  });

  // Handle Enter key
  document.getElementById('collections-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('save-btn').click();
    }
  });
}

// Save item to storage
function saveItem(item) {
  console.log('saveItem called with:', item);

  chrome.runtime.sendMessage({
    action: 'saveItem',
    item: item
  }, (response) => {
    console.log('saveItem response:', response);
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      showNotification('Error saving highlight', true);
      return;
    }

    if (response && response.success) {
      console.log('Item saved successfully');
      showNotification('Highlight saved successfully!');
    } else {
      console.error('Save failed:', response);
      showNotification('Error saving highlight', true);
    }
  });
}

// Show notification
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = 'news-highlights-notification';
  if (isError) notification.classList.add('error');
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize
console.log('Setting up event listeners');
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleTextSelection);

// Create save button when page loads
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - creating save button');
    saveButton = createSaveButton();
    console.log('Save button created:', saveButton);
  });
} else {
  console.log('Document already loaded, creating save button immediately');
  saveButton = createSaveButton();
  console.log('Save button created:', saveButton);
}

// Hide button when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (saveButton && !saveButton.contains(e.target)) {
    const dialog = document.getElementById('news-highlights-dialog');
    if (!dialog) {
      saveButton.style.display = 'none';
    }
  }
});
