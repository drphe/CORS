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
document.addEventListener("keydown", function (e) {
  const target = e.target;
  if (!shortcutToggle) return;

  if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
    if (e.key === " ") {
      const value = target.value;
      const words = value.split(" ");
      const lastWord = words[words.length - 1];

      if (shortcuts[lastWord]) {
        words[words.length - 1] = shortcuts[lastWord];
        target.value = words.join(" ") + " ";
        e.preventDefault(); // Ngăn thêm dấu cách mặc định
      }
    }
  }
});
