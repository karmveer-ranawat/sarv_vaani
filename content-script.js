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
          bubbles.forEach(bubble => {
            const isIncoming = bubble.classList.contains("message-in");
            const isOutgoing = bubble.classList.contains("message-out");
            const text = extractTextFromBubble(bubble);

            if (text && text.startsWith("!")) {
              const cleanText = text.slice(1).trim();
              const translated = dummyTranslateWithGemini(cleanText, isIncoming ? "incoming" : "outgoing");

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
