// Add this file to your extension
chrome.runtime.onInstalled.addListener(() => {
	// This will prompt the user to enter their API key on first install
	chrome.storage.sync.get(["geminiApiKey"], (result) => {
		if (!result.geminiApiKey) {
			chrome.tabs.create({
				url: "options.html",
			});
		}
	});
	chrome.sidePanel.setOptions({
		path: "side-panel.html",
		enabled: true,
	});

	// Optional: open side panel when extension icon is clicked
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
