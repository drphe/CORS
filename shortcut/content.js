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

function attachListenerToInputs(root = document) {
  const inputs = root.querySelectorAll("input, textarea, [contenteditable='true']");
  inputs.forEach((input) => {
    input.addEventListener("keydown", handleShortcut);
  });

  // Tìm và xử lý các shadowRoot bên trong root hiện tại
  const allElements = root.querySelectorAll("*");
  allElements.forEach((el) => {
    if (el.shadowRoot) {
      attachListenerToInputs(el.shadowRoot); // Đệ quy vào shadow DOM
    }
  });
}

function handleShortcut(e) {
  const target = e.target;
  if (!shortcutToggle) return;

  if (e.key === " ") {
    const value = target.value !== undefined ? target.value : target.innerText;
    const words = value.split(" ");
    const lastWord = words[words.length - 1];

    if (shortcuts[lastWord]) {
      e.preventDefault();
      words[words.length - 1] = shortcuts[lastWord];
      const newText = words.map(w => changeText(w)).join(" ") + " ";

      if (target.value !== undefined) {
        target.value = newText;
      } else {
        target.innerText = newText;

        // 👉 Đặt lại con trỏ về cuối
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}


const observer = new MutationObserver(() => {
  attachListenerToInputs();
});

observer.observe(document.body, { childList: true, subtree: true });

const commandList = ["/homnay", "/homqua", "/homkia", "/ngaymai", "/ngaymot"];

function changeText(textString) {
  return commandList.reduce(
    (text, command) => text.replaceAll(command, parseText(command)), textString
  );
}

function parseText(command) {
  const today = new Date();
  let result = [];

  switch (command) {
    case "/homnay":
      result.push(formatDate(today));
      break;

    case "/homqua":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      result.push(formatDate(yesterday));
      break;

    case "/homkia":
      const yesterdays = new Date(today);
      yesterdays.setDate(today.getDate() - 2);
      result.push(formatDate(yesterdays));
      break;

    case "/ngaymai":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      result.push(formatDate(tomorrow));
      break;

    case "/ngaymot":
      const tomorrows = new Date(today);
      tomorrows.setDate(today.getDate() + 2);
      result.push(formatDate(tomorrows));
      break;

    default:
      result.push(command);
  }

  return result;
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JS đếm từ 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}



