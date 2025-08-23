var pref = {
    'shortcutToggle': false,
    'cssToggle': true,
    'version': chrome.runtime.getManifest().version
};

chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.get(Object.keys(pref)).then(toggle => {
        for (let key in toggle) {
            if (key in pref) pref[key] = toggle[key];
        }
        chrome.storage.local.set(pref);
    });


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
    // css
    chrome.contextMenus.create({
        id: "css",
        title: "✨ Giao diện tùy chỉnh CSS...",
        contexts: ["action"] // Hiển thị khi nhấp chuột phải vào biểu tượng extension
    });
});

// Truy cập trang web tài chính
chrome.action.onClicked.addListener(function(tab) {
    const url = "https://drphe.github.io/BM/vnindex";
    chrome.tabs.create({
        url: url
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
        chrome.tabs.create({
            url: wichartUrl
        });
    }
    if (info.menuItemId === "open-guide") {
        chrome.tabs.create({
            url: "https://drphe.github.io/BM/hdsd.html"
        });
    }
    if (info.menuItemId === "banggotat") {
        chrome.tabs.create({
            url: "shortcut/dashboard.html"
        });
    }
    if (info.menuItemId === "css") {
        chrome.tabs.create({
            url: "morecss/dashboard.html"
        });
    }
});