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
            const text = extractTextFromBubble(bubble);
            if (text) {
              console.log("💬 Message detected:", text);
              // Translation logic here
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

// Watch for chat changes by observing the left chat list (or topbar)
function observeChatSwitch() {
  const chatPanel = document.querySelector("#pane-side");

  if (!chatPanel) {
    console.warn("❌ Chat panel not found.");
    return;
  }

  const chatSwitchObserver = new MutationObserver(() => {
    setTimeout(observeChatMessages, 500); // slight delay to allow chat to load
  });

  chatSwitchObserver.observe(chatPanel, {
    childList: true,
    subtree: true
  });

  console.log("🔄 Watching for chat switches...");
}

// Initial wait and setup
const initInterval = setInterval(() => {
  if (document.querySelector("#pane-side") && document.querySelector("#main")) {
    clearInterval(initInterval);
    observeChatSwitch();
    observeChatMessages();
  }
}, 1000);
