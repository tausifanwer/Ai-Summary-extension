let geminiApiKeys = "";
let timeOutIds = [];
document.querySelector("#summarize-button").addEventListener("click", () => {
	const resultDiv = document.querySelector("#result");

	const summaryType = document.querySelector("#summary-type").value;
	resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

	// get user api key from storage
	chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
		if (!geminiApiKey) {
			return (resultDiv.textContent = "Please set your API key .");
		} else {
			geminiApiKeys = geminiApiKey;
		}
	});
	//add content.js for the page text
	chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
		let urls = tab.url.split("://").join(".").split(".");
		if (urls.includes("www")) {
			urls = urls[2];
		} else {
			urls = urls[1];
		}
		if (!tab || !tab.id) {
			result.textContent = "No active tab found.";
			return;
		}

		try {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["content.js"],
			});

			chrome.tabs.sendMessage(
				tab.id,
				{ type: "GET_ARTICLE_TEXT" },
				async (text) => {
					if (chrome.runtime.lastError) {
						console.error("Message failed:", chrome.runtime.lastError.message);
						result.textContent = "Could not connect to content script.";
						return;
					}
					if (!text) {
						resultDiv.textContent = "Couldn't extract text from the page.";
						return;
					}
					//send text to gemini
					try {
						let setUrl = tab.url;
						function getFromStorage(key) {
							return new Promise((resolve) => {
								chrome.storage.sync.get([key], (result) => resolve(result));
							});
						}
						function setToStorage(url, summaryType, summary) {
							return new Promise(async (resolve) => {
								const existing = await getFromStorage(url);
								const existingData = existing[url] || {};

								existingData[summaryType] = summary;

								chrome.storage.sync.set({ [url]: existingData }, () =>
									resolve()
								);
							});
						}
						let summary = null;

						if (urls === "youtube") {
							if (tab.url === "https://www.youtube.com/") {
								throw new Error("Please open particular youtube video");
							}
							const result = await getFromStorage(setUrl);

							if (result[setUrl] && result[setUrl][summaryType]) {
								summary = result[setUrl][summaryType];
							} else {
								summary = await getGeminiSummary(
									tab.url,
									summaryType,
									geminiApiKeys,
									urls,
									tab.url
								);
								await setToStorage(setUrl, summaryType, summary);
							}
						} else {
							const result = await getFromStorage(setUrl);

							if (result[setUrl] && result[setUrl][summaryType]) {
								console.log("hi");
								summary = result[setUrl][summaryType];
							} else {
								summary = await getGeminiSummary(
									text,
									summaryType,
									geminiApiKeys,
									urls,
									tab.url
								);
								await setToStorage(setUrl, summaryType, summary);
							}
						}

						if (summary) {
							document.querySelector("#copy-btn").style.display = "block";
						} else {
							document.querySelector("#copy-btn").style.display = "none";
						}
						if (summaryType === "bullets") {
							summary = summary
								.split(/\*   /)
								.filter(Boolean)
								.map((item) => item.trim());
							console.log(summary);
							summary = summary.flat();
							console.log(summary);
						} else if (summaryType === "brief") {
							summary = summary.split(" ");
						} else {
							summary = summary
								.split(" ")
								.filter((word) => word !== "")
								.join(" ")
								.split("\n")
								.flatMap((line) => line.split("* "));

							console.log(summary);
						}
						function displaySummary() {
							timeOutIds.forEach(clearTimeout);
							timeOutIds = [];
							resultDiv.innerHTML = "";
							////
							summary.forEach((word, index) => {
								const timeOutId = setTimeout(() => {
									const span = document.createElement("span");
									span.textContent = word;
									resultDiv.appendChild(span);
									console.log("hi");
								}, index * 200);
								timeOutIds.push(timeOutId);
								console.log(timeOutIds);
							});
							///
						}
						displaySummary();
					} catch (error) {
						resultDiv.textContent = error.message || "Something went wrong .";
						resultDiv.style.color = "red";
					}
				}
			);
		} catch (error) {
			console.error("Failed to inject content script or send message:", error);
			result.textContent = "Could not prepare tab for communication.";
		}
	});
});
let prevSummaryType = "brief";
document.querySelector("#summary-type").addEventListener("change", (e) => {
	const summaryType = e.target.value;
	const resultDiv = document.querySelector("#result");
	if (summaryType !== prevSummaryType) {
		resultDiv.textContent = "Select a type and click summarize";
		resultDiv.style.color = "black";
		prevSummaryType = summaryType;
		document.querySelector("#copy-btn").style.display = "none";
		timeOutIds.forEach(clearTimeout);
		timeOutIds = [];
	}
});

async function getGeminiSummary(text, summaryType, apiKey, urls, link) {
	apiKey = apiKey.trim();
	let promptMap = undefined;
	if (urls !== "youtube") {
		const maxLimitText = 5000;
		const newText =
			text.length > maxLimitText ? text.slice(0, maxLimitText) : text;
		promptMap = {
			brief: `Summarize in 2-3 sentences:\n\n${newText}`,
			detailed: `Give a detailed summary:\n\n${newText}`,
			bullets: `summarize in 6-9 bullet points(start each line with "->"):\n\n ${newText}`,
		};
	} else {
		promptMap = {
			brief: `Tell me the summary brief on it in 2-3 sentences with timeStamp of the video`,
			detailed: `Tell me the summary details on it with timeStamp of the video`,
			bullets: `Tell me the summary in 6-9 bullet points with timeStamp of the video (start each line with "->")`,
		};
	}
	const prompt = promptMap[summaryType] || promptMap.brief;
	let response = undefined;
	if (urls === "youtube") {
		response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{ text: prompt },
								{
									file_data: {
										file_uri: link,
									},
								},
							],
						},
					],
				}),
			}
		);
	} else {
		response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: prompt }] }],
					generationConfig: {
						temperature: 0.2,
					},
				}),
			}
		);
	}

	if (!response.ok) {
		throw new Error(
			error.message || "Failed to fetch summary from Gemini API."
		);
	}
	const data = await response.json();

	return (
		data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available."
	);
}
document.querySelector("#copy-btn").addEventListener("click", () => {
	const txt = document.querySelector("#result").innerText;
	if (!txt) {
		alert("No text to copy.");
		return;
	}
	navigator.clipboard.writeText(txt).then(() => {
		const btn = document.querySelector("#copy-btn");
		const old = btn.textContent;
		btn.textContent = "Copied!";
		setTimeout(() => {
			btn.textContent = old;
		}, 2000);
	});
});

//close eventlistener
document.querySelector(".close-btn").addEventListener("click", () => {
	window.close();
});
