console.log("✅ ChatLang content script loaded!");

let messageObserver = null;
let lastMessageIds = new Set();
let currentChatId = null;

function extractTextFromBubble(bubble) {
  try {
    const spans = bubble.querySelectorAll("span.selectable-text span");
    return Array.from(spans).map(s => s.innerText).join(" ").trim();
  } catch (e) {
    return "";
  }
}

function getBubbleId(bubble) {
  return bubble.getAttribute("data-id") || bubble.getAttribute("id") || bubble.innerText.slice(0, 30);
}

function observeChatMessages() {
  const chatContainer = document.querySelector("#main .copyable-area");

  if (!chatContainer) {
    console.warn("❌ Chat container not found.");
    return;
  }

  if (messageObserver) {
    messageObserver.disconnect();
    console.log("🔁 Disconnected previous message observer.");
  }

  // Reset seen message IDs to avoid logging all old messages again
  lastMessageIds.clear();

  messageObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const bubbles = node.querySelectorAll("div.message-in, div.message-out");
          bubbles.forEach(bubble => {
            const bubbleId = getBubbleId(bubble);
            if (!lastMessageIds.has(bubbleId)) {
              lastMessageIds.add(bubbleId);

              const text = extractTextFromBubble(bubble);
              if (text) {
                console.log("💬 Message detected:", text);
                // Translation logic here
              }
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

  console.log("👀 Now observing messages in current chat...");
}

function getCurrentChatId() {
  const chatTitle = document.querySelector("#main header span[title]");
  return chatTitle ? chatTitle.innerText : null;
}

function observeChatSwitch() {
  const chatPanel = document.querySelector("#pane-side");

  if (!chatPanel) {
    console.warn("❌ Chat panel not found.");
    return;
  }

  const chatSwitchObserver = new MutationObserver(() => {
    const newChatId = getCurrentChatId();
    if (newChatId && newChatId !== currentChatId) {
      currentChatId = newChatId;
      console.log("🔁 Chat switched to:", currentChatId);
      setTimeout(observeChatMessages, 500); // delay to allow chat to load
    }
  });

  chatSwitchObserver.observe(chatPanel, {
    childList: true,
    subtree: true
  });

  console.log("🔄 Watching for chat switches...");
}

const initInterval = setInterval(() => {
  if (document.querySelector("#pane-side") && document.querySelector("#main")) {
    clearInterval(initInterval);
    observeChatSwitch();
    observeChatMessages();
  }
}, 1000);
