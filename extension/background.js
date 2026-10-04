// MindGraph Neural Link: Background Resonance Listener
// This service worker bridges the web dashboard (identity) to the extension (ingestion).

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log(`[Neural Link] Signal received from: ${sender.url} (Type: ${message.type})`);

  if (message.type === 'MINDGRAPH_IDENTITY_SYNC') {
    if (message.token) {
      chrome.storage.local.set({ token: message.token }, () => {
        console.log('[Neural Link] Identity Synchronized ✅');
        sendResponse({ success: true, status: 'synced' });
      });
    } else {
      chrome.storage.local.remove('token', () => {
        console.log('[Neural Link] Identity Cleared 🔒');
        sendResponse({ success: true, status: 'cleared' });
      });
    }
    return true; 
  }
});

// Periodic token check (Optional for future resilience)
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Neural Link] Siphon v2.0 Activated.');
});
