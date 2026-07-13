const CONTEXT_MENU_ID = 'host-on-100mini';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Host this page on 100mini',
    contexts: ['page', 'selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) return;

  // Open the popup first while user gesture is active
  chrome.action.openPopup();

  // Then asynchronously fetch the page HTML and store it
  chrome.tabs.sendMessage(tab.id, { action: 'getPageHtml' }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('Content script not available:', chrome.runtime.lastError.message);
      return;
    }
    if (response?.html) {
      chrome.storage.session.set({ pendingHtml: response.html });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPendingHtml') {
    chrome.storage.session.get('pendingHtml', (items) => {
      const html = items.pendingHtml || null;
      chrome.storage.session.remove('pendingHtml');
      sendResponse({ html });
    });
    return true;
  }
});
