document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
		if (geminiApiKey) {
			document.querySelector("#api-key").value = geminiApiKey;
		}
	});
	document.querySelector("#save-btn").addEventListener("click", () => {
		const apiKey = document.querySelector("#api-key").value.trim();
		if (!apiKey) {
			alert("Please enter a valid API key.");
			return;
		}
		chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
			document.querySelector(".success-message").style.display = "block";
			setTimeout(() => {
				return window.close();
			}, 1000);
		});
	});
});
