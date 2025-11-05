// Offscreen document for AI processing
// This runs in a hidden document that has access to LanguageModel API

console.log('=== OFFSCREEN DOCUMENT LOADED ===');
console.log('LanguageModel available:', typeof LanguageModel !== 'undefined');

// Immediately test availability on load
setTimeout(async () => {
  console.log('Testing AI availability on load...');
  const result = await checkAvailability();
  console.log('Availability result:', result);
}, 1000);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('=== Offscreen received message ===');
  console.log('Action:', request.action);
  console.log('Sender:', sender);

  if (request.action === 'checkAIAvailability') {
    console.log('Processing checkAIAvailability...');
    checkAvailability()
      .then((result) => {
        console.log('Sending availability result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('Error in checkAvailability:', error);
        sendResponse({ available: false, reason: 'Error: ' + error.message });
      });
    return true; // Keep channel open
  }

  if (request.action === 'clusterItems') {
    console.log('Processing clusterItems...');
    clusterItems(request.items)
      .then((result) => {
        console.log('Sending clustering result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('Error in clusterItems:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep channel open
  }

  console.warn('Unknown action:', request.action);
});

async function checkAvailability() {
  try {
    const aiService = new window.AIClusteringService();
    const result = await aiService.isAvailable();
    return result;
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, reason: error.message };
  }
}

async function clusterItems(items) {
  try {
    const aiService = new window.AIClusteringService();

    const availability = await aiService.isAvailable();
    if (!availability.available) {
      return { error: availability.reason };
    }

    const collections = await aiService.clusterItems(items);
    await aiService.destroy();

    return { success: true, collections };
  } catch (error) {
    console.error('Error clustering items:', error);
    return { error: error.message };
  }
}
