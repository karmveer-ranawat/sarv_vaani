# 🌍 ChatLang – Real-Time WhatsApp Message Translator

ChatLang is a lightweight Chrome extension that overlays WhatsApp Web and instantly translates both incoming and outgoing messages between English, Hindi, and Tamil — powered by Google Gemini.

---

## ⚡ Features

- 🔁 Real-time translation of incoming and outgoing messages
- 🌐 Supports Hindi, Tamil, and English
- 🧠 Uses Gemini API (streaming or non-streaming)
- 👀 Fully local — no message data is sent to any third-party server
- 💬 Seamlessly integrates into WhatsApp Web UI
- ⚙️ Configurable API key, model, and project settings

---

## 🛠 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/chatlang.git
cd chatlang
```

## 2. Load the Extension in Chrome

- Open `chrome://extensions`
- Enable **Developer Mode**
- Click **"Load unpacked"**
- Select the `chatlang/` folder you cloned

---

## 🔐 Set Your Gemini API Config

Click the ChatLang icon in Chrome's toolbar.

Fill in your Gemini API details:

- **API Key** (Service Account Key or OAuth token)
- **Project ID**
- **Model ID** (e.g. `gemini-1.5-pro-001`)
- Toggle **streaming** mode if desired

Click **Save**. Your settings will be stored locally.

---

## 🌐 How It Works

1. Messages on WhatsApp Web are detected via DOM observers.
2. Incoming and outgoing messages are extracted and cleaned.
3. Messages are sent to the Gemini model for translation.
4. Translations are injected just below each message bubble.

---

## 🧠 Gemini Model Configuration

> **Uses**: Gemini 1.5 Pro via Vertex AI  
> **Modes**: Both streaming and non-streaming

Sample API request for testing (non-streaming):

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/YOUR_MODEL_ID:streamGenerateContent" \
  -d '{
    "contents": {
      "role": "user",
      "parts": [
        { "text": "Translate to Hindi: Hello, how are you?" }
      ]
    }
  }'
```


Ensure your GCP IAM permissions and Vertex AI quotas are correctly set.

---

## 📁 Folder Structure

<pre lang="text"> ```text chatlang/ ├── manifest.json # Chrome extension manifest ├── background.js # Handles background events (if needed) ├── content-script.js # Injected into WhatsApp Web to hook messages ├── popup.html # UI for configuring API keys, model, etc. ├── popup.js # Logic for popup interactions ├── styles.css # Styling for the popup ├── icons/ # Extension icon assets │ ├── icon16.png │ ├── icon48.png │ └── icon128.png └── utils/ └── translator.js # Gemini streaming/non-streaming logic ``` </pre>

---

## 🔮 Features

- 🔄 Real-time inline translation of messages on WhatsApp Web
- 🤖 Powered by **Gemini 1.5 Pro** via Vertex AI
- 🚀 Supports **streaming and non-streaming** mode
- 🔒 Works fully client-side — privacy-conscious
- 🛠 Simple Chrome popup UI for API and model config
- 📌 Translations appear right below original messages

---

## 🧪 Coming Soon / Roadmap

- [ ] Auto-detect source and target languages
- [ ] User-defined language preference mapping
- [ ] Integration with Telegram Web and Signal Web
- [ ] Translation history with export options
- [ ] On/Off toggle switch in popup
- [ ] Voice input support for replies

---

## 👨‍💻 Author

Made with ❤️ by **[Your Name](https://github.com/yourusername)**  
Feedback and contributions are welcome!

---

## 📄 License

MIT License

You are free to use, modify, and distribute this software under the terms of the MIT license.
