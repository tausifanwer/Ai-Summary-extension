# 🧠 AI Summary For Articles

A Chrome extension that uses AI to summarize articles and webpages directly from your browser. Ideal for researchers, readers, and anyone who wants quick insights without reading the entire page.

---

## 🚀 Features

- 📄 **Summarize Any Article** – Get quick, concise summaries of articles and blogs.
- 🔍 **Side Panel Interface** – Non-intrusive UI that opens in Chrome’s side panel.
- ⚡ **Instant Results** – Automatically triggers on supported pages.
- 💾 **Settings Page** – Customize extension behavior via the options page.
- 🔐 **Secure and Fast** – Uses browser-native APIs and follows Chrome extension security practices.

---

## 🛠️ Installation

### Option 1: From GitHub (Development Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-summary-extension.git
2. Go to chrome://extensions/ in your browser.

3. Enable Developer Mode (top-right toggle).

4. Click Load Unpacked and select the folder where this extension was cloned.

5. Pin the extension from the Chrome toolbar and start summarizing!
---
Permissions Used
. "activeTab": To access current tab’s content.

. "scripting": For injecting scripts dynamically.

. "storage": To save user preferences.

. "sidePanel": To use Chrome's new side panel.

. "host_permissions": Set to <all_urls> for broad article support.
---
🧪 Usage
1. Once installed:

2. Navigate to an article or long webpage.

3. Click the extension icon or open the Chrome side panel.

4. The AI summary will be displayed instantly.
---
🧰 Development
If you're contributing or modifying the extension:

  Scripts are located in:

     1. content.js: Main DOM interaction.

     2. background.js: Event handlers and logic.

  UI:

    1. side-panel.html for the main interface.

    2. options.html for settings.
---
📜 License
  MIT License. See LICENSE file for details.
