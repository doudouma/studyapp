chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageHtml') {
    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    sendResponse({ html });
  }
});
