// Background service worker for News Highlights extension

// Initialize storage with HSP profile structure
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
  setupContextMenu();
});

// Initialize storage with HSP format
async function initializeStorage() {
  const data = await chrome.storage.local.get(['hspProfile']);

  if (!data.hspProfile) {
    const profile = {
      id: `profile_${generateId()}`,
      hsp: '0.1',
      type: 'profile',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content: {
        basic: {
          identity: {
            name: {
              assurance: 'self_declared',
              reliability: 'high',
              updated_at: new Date().toISOString(),
              value: 'News Highlights User'
            }
          }
        },
        preferences: {
          items: []
        }
      }
    };

    await chrome.storage.local.set({ hspProfile: profile });
  }
}

// Setup context menu
function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'save-highlight',
    title: 'Save as Highlight',
    contexts: ['selection']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-highlight' && info.selectionText) {
    const item = {
      id: `pref_${generateId()}`,
      value: info.selectionText,
      source_url: info.pageUrl,
      collections: [],
      notes: '',
      assurance: 'self_declared',
      reliability: 'high',
      state: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveItem(item);
  }
});

// Offscreen document management for AI
let offscreenDocumentCreated = false;

async function setupOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.DOM_PARSER], // Try DOM_PARSER instead
      justification: 'Access to window.ai API for on-device AI clustering'
    });
    offscreenDocumentCreated = true;
    console.log('Offscreen document created');
  } catch (error) {
    if (error.message.includes('Only a single offscreen')) {
      // Document already exists
      offscreenDocumentCreated = true;
    } else {
      console.error('Error creating offscreen document:', error);
      throw error;
    }
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);

  if (request.action === 'saveItem') {
    console.log('Saving item:', request.item);
    saveItem(request.item).then(() => {
      console.log('Item saved successfully');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Error saving item:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'getItems') {
    getItems().then((items) => {
      console.log('Returning items:', items.length, 'items');
      console.log('Items:', items);
      sendResponse({ items });
    }).catch((error) => {
      console.error('Error getting items:', error);
      sendResponse({ items: [] });
    });
    return true;
  } else if (request.action === 'deleteItem') {
    deleteItem(request.itemId).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'updateItem') {
    updateItem(request.item).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'exportData') {
    exportData().then((data) => {
      sendResponse({ data });
    });
    return true;
  } else if (request.action === 'importData') {
    importData(request.data).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'getCollections') {
    getCollections().then((collections) => {
      sendResponse({ collections });
    });
    return true;
  } else if (request.action === 'checkAIAvailability') {
    // Forward to offscreen document
    console.log('Forwarding checkAIAvailability to offscreen...');
    setupOffscreenDocument()
      .then(() => {
        console.log('Offscreen document ready, sending message...');
        // Send to offscreen document and wait for response
        return chrome.runtime.sendMessage({ action: 'checkAIAvailability' });
      })
      .then((response) => {
        console.log('Response from offscreen:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        sendResponse(response);
      })
      .catch((error) => {
        console.error('Error with offscreen document:', error);
        console.error('Error stack:', error.stack);
        sendResponse({ available: false, reason: 'Error creating/communicating with offscreen: ' + error.message });
      });
    return true;
  } else if (request.action === 'clusterItems') {
    // Forward to offscreen document
    console.log('Forwarding clusterItems to offscreen...');
    setupOffscreenDocument().then(() => {
      return chrome.runtime.sendMessage({
        action: 'clusterItems',
        items: request.items
      });
    }).then((response) => {
      console.log('Clustering response from offscreen:', response);
      sendResponse(response);
    }).catch((error) => {
      console.error('Error with offscreen document:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
});

// Save item to storage
async function saveItem(item) {
  const data = await chrome.storage.local.get(['hspProfile']);
  const profile = data.hspProfile;

  console.log('Current profile before save:', profile);

  if (!profile.content.preferences.items) {
    profile.content.preferences.items = [];
  }

  profile.content.preferences.items.unshift(item);
  profile.updated_at = new Date().toISOString();

  await chrome.storage.local.set({ hspProfile: profile });
  console.log('Profile saved. Total items:', profile.content.preferences.items.length);
}

// Get all items
async function getItems() {
  const data = await chrome.storage.local.get(['hspProfile']);
  console.log('getItems - raw data:', data);
  const items = data.hspProfile?.content?.preferences?.items || [];
  console.log('getItems - returning items:', items.length);
  return items;
}

// Delete item
async function deleteItem(itemId) {
  const data = await chrome.storage.local.get(['hspProfile']);
  const profile = data.hspProfile;

  profile.content.preferences.items = profile.content.preferences.items.filter(
    item => item.id !== itemId
  );
  profile.updated_at = new Date().toISOString();

  await chrome.storage.local.set({ hspProfile: profile });
}

// Update item
async function updateItem(updatedItem) {
  console.log('updateItem called with:', updatedItem);
  const data = await chrome.storage.local.get(['hspProfile']);
  const profile = data.hspProfile;

  const index = profile.content.preferences.items.findIndex(
    item => item.id === updatedItem.id
  );

  if (index !== -1) {
    console.log('Found item at index:', index);
    updatedItem.updated_at = new Date().toISOString();
    profile.content.preferences.items[index] = updatedItem;
    profile.updated_at = new Date().toISOString();

    await chrome.storage.local.set({ hspProfile: profile });
    console.log('Item updated successfully');
  } else {
    console.warn('Item not found with id:', updatedItem.id);
  }
}

// Export data in HSP format
async function exportData() {
  const data = await chrome.storage.local.get(['hspProfile']);
  return data.hspProfile;
}

// Import data
async function importData(hspData) {
  // Validate basic HSP structure
  if (!hspData.hsp || !hspData.type || !hspData.content) {
    throw new Error('Invalid HSP format');
  }

  await chrome.storage.local.set({ hspProfile: hspData });
}

// Get all unique collections
async function getCollections() {
  const items = await getItems();
  const collections = new Set();

  items.forEach(item => {
    if (item.collections && Array.isArray(item.collections)) {
      item.collections.forEach(collection => collections.add(collection));
    }
  });

  return Array.from(collections).sort();
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
