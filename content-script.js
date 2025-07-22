console.log("✅ ChatLang content script loaded!");

function extractTextFromBubble(bubble) {
  try {
    const spans = bubble.querySelectorAll("span.selectable-text span");
    return Array.from(spans).map(s => s.innerText).join(" ").trim();
  } catch (e) {
    return "";
  }
}

// Attach observer to all message bubbles (in + out)
const observeChatMessages = () => {
  const chatContainer = document.querySelector("#main .copyable-area");

  if (!chatContainer) {
    console.warn("❌ Chat container not found yet.");
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const messageBubbles = node.querySelectorAll("div.message-in, div.message-out");
          messageBubbles.forEach(bubble => {
            const text = extractTextFromBubble(bubble);
            if (text) {
              console.log("💬 Message detected:", text);
              // Translation logic will go here
            }
          });
        }
      });
    });
  });

  observer.observe(chatContainer, {
    childList: true,
    subtree: true
  });

  console.log("👀 Now observing WhatsApp Web chat bubbles...");
};

// Retry until chat container is ready
const interval = setInterval(() => {
  const found = document.querySelector("#main .copyable-area");
  if (found) {
    clearInterval(interval);
    observeChatMessages();
  }
}, 1000);
