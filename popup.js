// Popup script for News Highlights extension

let allItems = [];
let filteredItems = [];
let currentSearch = '';
let currentCollection = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadItems();
  await loadCollections();
  setupEventListeners();
});

// Load all items
async function loadItems() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getItems' }, (response) => {
      console.log('getItems response:', response);
      if (chrome.runtime.lastError) {
        console.error('Error loading items:', chrome.runtime.lastError);
        allItems = [];
      } else {
        allItems = response?.items || [];
      }
      filterAndDisplayItems();
      resolve();
    });
  });
}

// Load collections for filter dropdown
async function loadCollections() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getCollections' }, (response) => {
      console.log('getCollections response:', response);
      if (chrome.runtime.lastError) {
        console.error('Error loading collections:', chrome.runtime.lastError);
        resolve();
        return;
      }

      const collections = response?.collections || [];
      const select = document.getElementById('collection-filter');

      // Clear existing options except first one
      while (select.options.length > 1) {
        select.remove(1);
      }

      collections.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection;
        option.textContent = collection;
        select.appendChild(option);
      });
      resolve();
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    filterAndDisplayItems();
  });

  document.getElementById('collection-filter').addEventListener('change', (e) => {
    currentCollection = e.target.value;
    filterAndDisplayItems();
  });

  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });

  document.getElementById('import-file-input').addEventListener('change', importData);

  document.getElementById('ai-cluster-btn').addEventListener('click', startAIClustering);
}

// Filter and display items
function filterAndDisplayItems() {
  filteredItems = allItems.filter(item => {
    // Search filter
    const matchesSearch = !currentSearch ||
      item.value.toLowerCase().includes(currentSearch) ||
      (item.source_url && item.source_url.toLowerCase().includes(currentSearch)) ||
      (item.collections && item.collections.some(c => c.toLowerCase().includes(currentSearch)));

    // Collection filter
    const matchesCollection = !currentCollection ||
      (item.collections && item.collections.includes(currentCollection));

    return matchesSearch && matchesCollection;
  });

  displayItems();
}

// Display items
function displayItems() {
  console.log('displayItems called. allItems:', allItems.length, 'filteredItems:', filteredItems.length);
  console.log('filteredItems:', filteredItems);

  const container = document.getElementById('items-container');
  const emptyState = document.getElementById('empty-state');
  const itemCount = document.getElementById('item-count');

  container.innerHTML = '';

  if (filteredItems.length === 0) {
    console.log('No filtered items, showing empty state');
    emptyState.classList.add('show');
    itemCount.textContent = '0 highlights';
    return;
  }

  console.log('Showing items. Removing empty state and displaying container.');
  emptyState.classList.remove('show');
  itemCount.textContent = `${filteredItems.length} highlight${filteredItems.length !== 1 ? 's' : ''}`;

  console.log('Creating cards for', filteredItems.length, 'items');
  filteredItems.forEach((item, index) => {
    console.log(`Creating card ${index + 1}:`, item);
    try {
      const card = createItemCard(item);
      console.log(`Card ${index + 1} created:`, card);
      container.appendChild(card);
      console.log(`Card ${index + 1} appended to container`);
    } catch (error) {
      console.error(`Error creating card ${index + 1}:`, error);
    }
  });
  console.log('All cards created. Container children:', container.children.length);
}

// Create item card element
function createItemCard(item) {
  console.log('createItemCard called with:', item);
  const card = document.createElement('div');
  card.className = 'item-card';

  const header = document.createElement('div');
  header.className = 'item-header';

  const source = document.createElement('a');
  source.className = 'item-source';
  source.href = item.source_url;
  source.target = '_blank';
  source.textContent = getHostname(item.source_url);
  source.title = item.source_url;

  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const copyBtn = createActionButton(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`,
    'Copy text',
    () => copyToClipboard(item.value)
  );

  const editBtn = createActionButton(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`,
    'Edit',
    () => editItem(item)
  );

  const deleteBtn = createActionButton(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`,
    'Delete',
    () => deleteItem(item.id),
    'delete-btn'
  );

  actions.appendChild(copyBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  header.appendChild(source);
  header.appendChild(actions);

  const value = document.createElement('div');
  value.className = 'item-value';
  value.textContent = item.value;

  // Collapse long text
  const shouldCollapse = item.value.length > 200;
  if (shouldCollapse) {
    value.classList.add('collapsed');
    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-btn';
    showMoreBtn.textContent = 'Show more';
    showMoreBtn.addEventListener('click', () => {
      value.classList.toggle('collapsed');
      showMoreBtn.textContent = value.classList.contains('collapsed') ? 'Show more' : 'Show less';
    });
    card.appendChild(header);
    card.appendChild(value);
    card.appendChild(showMoreBtn);
  } else {
    card.appendChild(header);
    card.appendChild(value);
  }

  // Notes section
  const notesContainer = document.createElement('div');
  notesContainer.className = 'item-notes-container';

  const notesLabel = document.createElement('label');
  notesLabel.className = 'item-notes-label';
  notesLabel.textContent = 'Notes:';

  const notesTextarea = document.createElement('textarea');
  notesTextarea.className = 'item-notes-textarea';
  notesTextarea.placeholder = 'Add your notes here...';
  notesTextarea.value = item.notes || '';
  notesTextarea.rows = 2;

  // Auto-save notes on blur
  notesTextarea.addEventListener('blur', () => {
    const newNotes = notesTextarea.value.trim();
    if (newNotes !== (item.notes || '')) {
      item.notes = newNotes;
      chrome.runtime.sendMessage({ action: 'updateItem', item }, (response) => {
        if (response?.success) {
          console.log('Notes saved for item:', item.id);
        }
      });
    }
  });

  // Auto-expand textarea as user types
  notesTextarea.addEventListener('input', () => {
    notesTextarea.style.height = 'auto';
    notesTextarea.style.height = notesTextarea.scrollHeight + 'px';
  });

  notesContainer.appendChild(notesLabel);
  notesContainer.appendChild(notesTextarea);
  card.appendChild(notesContainer);

  const footer = document.createElement('div');
  footer.className = 'item-footer';

  const collections = document.createElement('div');
  collections.className = 'item-collections';

  if (item.collections && item.collections.length > 0) {
    item.collections.forEach(collection => {
      const tag = document.createElement('span');
      tag.className = 'collection-tag';
      tag.textContent = collection;
      collections.appendChild(tag);
    });
  }

  const date = document.createElement('div');
  date.className = 'item-date';
  date.textContent = formatDate(item.created_at);

  footer.appendChild(collections);
  footer.appendChild(date);

  card.appendChild(footer);

  console.log('Card fully built, returning:', card);
  return card;
}

// Create action button
function createActionButton(iconSvg, title, onClick, className = '') {
  const btn = document.createElement('button');
  btn.innerHTML = iconSvg;
  btn.title = title;
  if (className) btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Edit item
function editItem(item) {
  const newCollections = prompt('Edit collections (comma-separated):', item.collections.join(', '));

  if (newCollections !== null) {
    const updatedItem = {
      ...item,
      collections: newCollections.split(',').map(c => c.trim()).filter(c => c.length > 0)
    };

    chrome.runtime.sendMessage({ action: 'updateItem', item: updatedItem }, async (response) => {
      if (response.success) {
        await loadItems();
        await loadCollections();
        showNotification('Highlight updated');
      }
    });
  }
}

// Delete item
function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this highlight?')) {
    chrome.runtime.sendMessage({ action: 'deleteItem', itemId }, async (response) => {
      if (response.success) {
        await loadItems();
        await loadCollections();
        showNotification('Highlight deleted');
      }
    });
  }
}

// Export data
function exportData() {
  chrome.runtime.sendMessage({ action: 'exportData' }, (response) => {
    const dataStr = JSON.stringify(response.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `news-highlights-export-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Data exported');
  });
}

// Import data
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      chrome.runtime.sendMessage({ action: 'importData', data }, async (response) => {
        if (response.success) {
          await loadItems();
          await loadCollections();
          showNotification('Data imported successfully');
        } else {
          alert('Error importing data: ' + response.error);
        }
      });
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = '';
}

// Show notification
function showNotification(message) {
  // Simple notification using badge
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 2000);
}

// Get hostname from URL
function getHostname(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Tag all items that contain statistics using AI detection
async function tagStatisticsInAllItems(aiService) {
  let taggedCount = 0;

  console.log('>>> tagStatisticsInAllItems() called');
  console.log('>>> Total allItems:', allItems.length);
  console.log('>>> aiService:', aiService);

  // Get items that don't already have Statistics tag
  const itemsToCheck = allItems.filter(item => !item.collections.includes('Statistics'));

  console.log('>>> Items WITHOUT Statistics tag:', itemsToCheck.length);
  console.log('>>> Items to check:', itemsToCheck.map(i => ({
    id: i.id,
    value: i.value.substring(0, 50) + '...',
    collections: i.collections
  })));

  if (itemsToCheck.length === 0) {
    console.log('>>> All items already have Statistics tag - RETURNING 0');
    return 0;
  }

  console.log(`>>> Calling aiService.detectStatistics() with ${itemsToCheck.length} items...`);

  // Use AI to detect statistics
  const statisticsItems = await aiService.detectStatistics(itemsToCheck);

  console.log(`>>> AI RETURNED ${statisticsItems.length} items with statistics`);
  console.log('>>> Statistics items:', statisticsItems.map(i => ({
    id: i.id,
    value: i.value.substring(0, 50) + '...'
  })));

  // Tag the items
  console.log('>>> Starting to tag items...');
  for (let i = 0; i < statisticsItems.length; i++) {
    const item = statisticsItems[i];
    console.log(`>>> Tagging item ${i + 1}/${statisticsItems.length}: ${item.value.substring(0, 50)}...`);

    item.collections.push('Statistics');
    console.log(`>>> Collections after push:`, item.collections);

    // Update the item in storage
    console.log('>>> Sending updateItem message to background...');
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'updateItem', item }, (response) => {
        console.log('>>> updateItem response:', response);
        if (response?.success) {
          taggedCount++;
          console.log(`>>> SUCCESS: Tagged count now ${taggedCount}`);
        } else {
          console.log('>>> FAILED: Response was not successful');
        }
        resolve();
      });
    });
  }

  console.log(`>>> Total tagged: ${taggedCount}`);

  // Reload items if any were tagged
  if (taggedCount > 0) {
    console.log('>>> Reloading items and collections...');
    await loadItems();
    await loadCollections();
    console.log('>>> Reload complete');
  }

  console.log(`>>> RETURNING: ${taggedCount}`);
  return taggedCount;
}

// AI Clustering functionality
async function startAIClustering() {
  console.log('===== AI SMART COLLECTIONS BUTTON CLICKED =====');
  console.log('Total items loaded:', allItems.length);
  console.log('Items:', allItems);

  if (allItems.length === 0) {
    console.log('ERROR: No items found');
    alert('No highlights to cluster. Save some highlights first!');
    return;
  }

  if (allItems.length < 3) {
    console.log('WARNING: Less than 3 items');
    alert('You need at least 3 highlights for AI clustering to work effectively.');
    return;
  }

  // Show loading state
  const btn = document.getElementById('ai-cluster-btn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span style="animation: spin 1s linear infinite; display: inline-block;">⏳</span>';
  btn.disabled = true;

  try {
    // Access AI directly from popup using LanguageModel API
    console.log('Creating AIClusteringService...');
    const aiService = new window.AIClusteringService();
    console.log('AIClusteringService created:', aiService);

    // Check availability
    console.log('===== STEP 1: Checking AI availability =====');
    const availability = await aiService.isAvailable();
    console.log('Availability result:', availability);

    if (!availability.available) {
      console.log('ERROR: AI not available:', availability.reason);
      alert(`AI Smart Collections is not available:\n\n${availability.reason}\n\nPlease ensure you have:\n- Chrome 127 or later\n- Enabled "Prompt API for Gemini Nano" in chrome://flags\n- Downloaded the Gemini Nano model in chrome://components`);
      return;
    }

    // First, automatically tag statistics using AI
    console.log('===== STEP 2: Detecting and tagging statistics with AI =====');
    const statsTagged = await tagStatisticsInAllItems(aiService);
    console.log(`✓ Tagged ${statsTagged} items with Statistics collection`);

    console.log('===== STEP 3: Starting semantic clustering =====');

    // Cluster items
    const suggestedCollections = await aiService.clusterItems(allItems);

    console.log('Suggested collections:', suggestedCollections);

    if (!suggestedCollections || suggestedCollections.length === 0) {
      // Show statistics tagging result even if no AI collections found
      if (statsTagged > 0) {
        alert(`✓ Tagged ${statsTagged} highlight${statsTagged !== 1 ? 's' : ''} with "Statistics"!\n\nNo additional semantic collections could be identified. Try adding more diverse highlights.`);
      } else {
        alert('No meaningful collections could be identified. Try adding more diverse highlights.');
      }
      return;
    }

    // Show suggestions dialog (will include statistics info)
    showCollectionSuggestionsDialog(suggestedCollections, statsTagged);

    // Clean up
    await aiService.destroy();
  } catch (error) {
    console.error('Error during AI clustering:', error);
    alert(`Error during AI clustering:\n\n${error.message}`);
  } finally {
    // Restore button state
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// Show collection suggestions dialog
function showCollectionSuggestionsDialog(suggestedCollections, statsTagged = 0) {
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'ai-suggestions-dialog';

  const statsMessage = statsTagged > 0
    ? `<p class="ai-suggestions-description" style="background: #e8f5e9; padding: 12px; border-radius: 6px; border-left: 4px solid #4caf50; margin-bottom: 12px;">
        ✓ Tagged ${statsTagged} highlight${statsTagged !== 1 ? 's' : ''} with "Statistics" collection
       </p>`
    : '';

  dialog.innerHTML = `
    <div class="ai-suggestions-content">
      <div class="ai-suggestions-header">
        <h2>AI Smart Collections</h2>
        <button class="close-btn" id="close-suggestions">✕</button>
      </div>
      ${statsMessage}
      <p class="ai-suggestions-description">
        Gemini Nano has analyzed your highlights and suggested these semantic collections:
      </p>
      <div class="ai-suggestions-list" id="suggestions-list">
        <!-- Collections will be inserted here -->
      </div>
      <div class="ai-suggestions-actions">
        <button id="apply-all-suggestions" class="btn-primary">Apply All</button>
        <button id="cancel-suggestions" class="btn-secondary">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Populate suggestions
  const listContainer = document.getElementById('suggestions-list');
  suggestedCollections.forEach((collection, index) => {
    const collectionCard = document.createElement('div');
    collectionCard.className = 'suggestion-collection-card';
    collectionCard.innerHTML = `
      <div class="suggestion-collection-header">
        <input type="checkbox" id="collection-${index}" checked />
        <label for="collection-${index}">
          <strong>${collection.name}</strong>
          <span class="suggestion-count">${collection.items.length} highlights</span>
        </label>
      </div>
      <p class="suggestion-description">${collection.description}</p>
      <div class="suggestion-preview">
        ${collection.items.slice(0, 3).map(item =>
          `<div class="suggestion-preview-item">${truncateText(item.value, 80)}</div>`
        ).join('')}
        ${collection.items.length > 3 ? `<div class="suggestion-more">+${collection.items.length - 3} more</div>` : ''}
      </div>
    `;
    listContainer.appendChild(collectionCard);
  });

  // Event listeners
  document.getElementById('close-suggestions').addEventListener('click', () => {
    dialog.remove();
  });

  document.getElementById('cancel-suggestions').addEventListener('click', () => {
    dialog.remove();
  });

  document.getElementById('apply-all-suggestions').addEventListener('click', async () => {
    await applySuggestedCollections(suggestedCollections);
    dialog.remove();
  });
}

// Apply suggested collections to items
async function applySuggestedCollections(suggestedCollections) {
  console.log('Applying suggested collections...');

  // Get selected collections
  const selectedCollections = suggestedCollections.filter((_, index) => {
    const checkbox = document.getElementById(`collection-${index}`);
    return checkbox && checkbox.checked;
  });

  if (selectedCollections.length === 0) {
    alert('No collections selected.');
    return;
  }

  // Update items with new collections
  let updateCount = 0;

  for (const collection of selectedCollections) {
    for (const item of collection.items) {
      // Add collection if not already present
      if (!item.collections.includes(collection.name)) {
        item.collections.push(collection.name);

        // Update item in storage
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'updateItem', item }, (response) => {
            if (response?.success) {
              updateCount++;
            }
            resolve();
          });
        });
      }
    }
  }

  // Reload items and collections
  await loadItems();
  await loadCollections();

  alert(`Successfully applied ${selectedCollections.length} collections to ${updateCount} highlights!`);
}

// Helper function (if not already defined)
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
