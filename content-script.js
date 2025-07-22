console.log("✅ ChatLang content script loaded!");

let messageObserver = null;

function extractTextFromBubble(bubble) {
  try {
    const spans = bubble.querySelectorAll("span.selectable-text span");
    return Array.from(spans).map(s => s.innerText).join(" ").trim();
  } catch (e) {
    return "";
  }
}

function injectTranslation(bubble, translatedText) {
  if (!bubble || bubble.querySelector(".chatlang-translation")) return;

  const translationNode = document.createElement("div");
  translationNode.className = "chatlang-translation";
  translationNode.innerText = translatedText;

  translationNode.style.fontSize = "0.75rem";
  translationNode.style.color = "gray";
  translationNode.style.fontStyle = "italic";
  translationNode.style.marginTop = "4px";

  const textContainer = bubble.querySelector("div.copyable-text");

  if (textContainer) {
    textContainer.appendChild(translationNode);
  }
}

// function dummyTranslateWithGemini(text, direction = "auto") {
//   // Placeholder for Gemini translation logic
//   console.log(`🌐 Translating [${direction}]:`, text);
//   return `[Translated] ${text}`;
// }

async function dummyTranslateWithGemini(text, direction = "auto") {
  return new Promise((resolve) => {
    chrome.storage.local.get(["projectId", "modelId", "accessToken"], async (result) => {
      const { projectId, modelId, accessToken } = result;

      if (!projectId || !modelId || !accessToken) {
        return resolve("[Missing credentials: set in extension popup]");
      }

      const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelId}:streamGenerateContent`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: {
              role: "user",
              parts: [
                {
                  text: `Translate the following ${direction} message:\n\n${text} . \n\n\n Auto detect the text language and convert to english. \n\n Output Syntax => Text : `
                }
              ]
            }
          })
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream")) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let resultText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.replace("data: ", ""));
                  const part = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  resultText += part;
                } catch (err) {
                  console.warn("Invalid stream chunk:", line);
                }
              }
            }
          }

          return resolve(resultText.trim() || "[Empty stream response]");
        } else {
          const json = await response.json();
          const results = Array.isArray(json) ? json : [json];

          const finalText = results
            .map(r => r?.candidates?.[0]?.content?.parts?.[0]?.text || "")
            .join(" ")
            .trim();

          return resolve(finalText || "[Empty response]");
        }
      } catch (err) {
        console.error("Vertex Gemini error:", err);
        return resolve("[Error from Vertex Gemini]");
      }
    });
  });
}


function observeChatMessages() {
  const chatContainer = document.querySelector("#main .copyable-area");

  if (!chatContainer) {
    console.warn("❌ Chat container not found.");
    return;
  }

  if (messageObserver) {
    messageObserver.disconnect();
  }

  messageObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const bubbles = node.querySelectorAll("div.message-in, div.message-out");
          bubbles.forEach(async bubble => {
            const isIncoming = bubble.classList.contains("message-in");
            const isOutgoing = bubble.classList.contains("message-out");
            const text = extractTextFromBubble(bubble);

            if (text && text.startsWith("!")) {
              const cleanText = text.slice(1).trim();
              const translated = await dummyTranslateWithGemini(cleanText, isIncoming ? "incoming" : "outgoing");

              console.log(`🔁 Translated (${isIncoming ? "IN" : "OUT"}):`, translated);

              injectTranslation(bubble, translated);
            }
          });
        }
      });
    });
  });

  messageObserver.observe(chatContainer, {
    childList: true,
    subtree: true
  });

  console.log("👀 Now observing new messages in current chat...");
}

function observeChatSwitch() {
  const chatPanel = document.querySelector("#pane-side");

  if (!chatPanel) {
    console.warn("❌ Chat panel not found.");
    return;
  }

  const chatSwitchObserver = new MutationObserver(() => {
    setTimeout(observeChatMessages, 500);
  });

  chatSwitchObserver.observe(chatPanel, {
    childList: true,
    subtree: true
  });

  console.log("🔄 Watching for chat switches...");
}

// Initial setup
const initInterval = setInterval(() => {
  if (document.querySelector("#pane-side") && document.querySelector("#main")) {
    clearInterval(initInterval);
    observeChatSwitch();
    observeChatMessages();
  }
}, 1000);
