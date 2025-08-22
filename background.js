// Truy cập trang web tài chính
chrome.action.onClicked.addListener(function(tab) {
  const url = "https://drphe.github.io/BM/vnindex";
 chrome.tabs.create({ url: url });
});

 
chrome.runtime.onInstalled.addListener(() => {
chrome.storage.sync.set({ shortcutToggle: false });
// menu mở Wichart
  chrome.contextMenus.create({
    id: "wichart",
    title: "Mở Wichart",
    contexts: ["page", "selection", "link", "image"],
    documentUrlPatterns: ["*://*.drphe.github.io/*"]
  });

// Đăng nhập tài khoản Vieon VIP
  chrome.contextMenus.create({
    id: "loadVieonAccounts",
    title: "Nạp tài khoản Vieon",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.vieon.vn/*"]
  });

// Hướng dẫn sử dụng
    chrome.contextMenus.create({
        id: "open-guide",
        title: "📄 Hướng dẫn sử dụng",
        contexts: ["action"] // Hiển thị khi nhấp chuột phải vào biểu tượng extension
    });

// bảng gõ tắt
    chrome.contextMenus.create({
        id: "banggotat",
        title: "✏️ Soạn bảng gõ tắt...",
        contexts: ["action"] // Hiển thị khi nhấp chuột phải vào biểu tượng extension
    });
});
// Lắng nghe sự kiện click vào nút menu context
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "loadVieonAccounts") {
    // Mở popup.html trong một cửa sổ mới
    chrome.windows.create({
      url: 'vieon_helper/popup.html',
      type: 'popup',
      width: 500,
      height: 650
    });
  }
  if (info.menuItemId === "wichart") {
    const wichartUrl = "https://wichart.vn";
    // Mở một tab mới với URL đã chỉ định.
    chrome.tabs.create({ url: wichartUrl });
  }
    if (info.menuItemId === "open-guide") {
        // Mở file hướng dẫn trong một tab mới
        chrome.tabs.create({ url: "https://drphe.github.io/BM/hdsd.html" });
    }
    if (info.menuItemId === "banggotat") {
        // Mở file hướng dẫn trong một tab mới
        chrome.tabs.create({ url: "shortcut/dashboard.html" });
    }
});

