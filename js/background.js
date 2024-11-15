chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ 'url': chrome.runtime.getURL('main.html') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getAutofillSettings") {
        chrome.storage.sync.get([
            'autofillEnabled',        
            'activeProfile',
            'profiles',
            'autofillOption',
            'whitelistDomains',
            'blacklistDomains'
        ], (settings) => {
            sendResponse(settings);
        });
        return true; // Indicates we’ll respond asynchronously
    }
});
