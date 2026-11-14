const CONTEXT_MENU_ID = 'host-on-100mini';
const PENDING_TAB_KEY = 'pendingCaptureTabId';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Host this page on 100mini',
    contexts: ['page', 'selection'],
  });
});

// Step 1 — right click: remember which tab the user targeted, then open the popup.
// The actual capture happens on demand in step 2, so the background context and
// the popup context never have to wait on each other.
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) return;

  await rememberPendingTab(tab.id);
  openPopup();
});

async function rememberPendingTab(tabId) {
  try {
    await chrome.storage.session.set({ [PENDING_TAB_KEY]: tabId });
  } catch (err) {
    // Still open the popup: the user can paste the HTML by hand.
    console.warn('Could not remember target tab:', err);
  }
}

function openPopup() {
  try {
    // Chrome 127+. The context menu click is the user gesture that authorises it.
    chrome.action.openPopup().catch((err) => console.warn('openPopup failed:', err));
  } catch (err) {
    console.warn('openPopup unavailable:', err);
  }
}

// Step 2 — the popup asks for the HTML once it has loaded.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'getPendingHtml') return;
  handlePendingRequest().then(sendResponse);
  return true; // async response
});

async function handlePendingRequest() {
  let tabId = null;
  try {
    const stored = await chrome.storage.session.get(PENDING_TAB_KEY);
    tabId = stored[PENDING_TAB_KEY] ?? null;
    if (tabId !== null) await chrome.storage.session.remove(PENDING_TAB_KEY);
  } catch (err) {
    console.warn('Could not read extension storage:', err);
    return { html: null, error: 'Extension storage is unavailable. Reload the extension and try again.' };
  }

  // No pending capture: the popup was opened normally (toolbar click).
  if (tabId === null) return { html: null };

  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageHtml' });
    if (!response?.html) {
      return { html: null, error: 'The page returned no HTML. Paste it manually instead.' };
    }
    return { html: response.html };
  } catch (err) {
    // No content script in that tab: restricted page (chrome://, Web Store, PDF
    // viewer) or the page was loaded before the extension was installed/reloaded.
    console.warn('Could not read page HTML:', err?.message || err);
    return {
      html: null,
      error: 'This page cannot be read. Reload the page and right-click again, or paste the HTML manually.',
    };
  }
}
