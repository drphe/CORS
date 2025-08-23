let shortcutToggle = false;
let shortcuts = {};

// Lấy dữ liệu ban đầu từ storage
chrome.storage.sync.get(["shortcuts", "shortcutToggle"], (data) => {
  shortcuts = data.shortcuts || {};
  shortcutToggle = data.shortcutToggle;
});

// Theo dõi thay đổi trong storage để cập nhật trạng thái toggle và shortcuts
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync") {
    if (changes.shortcutToggle) {
      shortcutToggle = changes.shortcutToggle.newValue;
    }
    if (changes.shortcuts) {
      shortcuts = changes.shortcuts.newValue || {};
    }
  }
});

// Lắng nghe sự kiện nhấn phím
function attachListenerToInputs() {
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("keydown", handleShortcut);
  });
}

function handleShortcut(e) {
  const target = e.target;
  if (!shortcutToggle) return;

  if (e.key === " ") {
    const value = target.value;
    const words = value.split(" ");
    const lastWord = words[words.length - 1];

    if (shortcuts[lastWord]) {
      e.preventDefault();
      words[words.length - 1] = shortcuts[lastWord];
      target.value = words.join(" ") + " ";
    }
  }
}

const observer = new MutationObserver(() => {
  attachListenerToInputs();
});

observer.observe(document.body, { childList: true, subtree: true });




