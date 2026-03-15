function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("MyCacheDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("cache")) {
                db.createObjectStore("cache", {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveData(id, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("cache", "readwrite");
        tx.objectStore("cache").put({
            id,
            data
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function getData(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("cache", "readonly");
        const req = tx.objectStore("cache").get(id);
        req.onsuccess = () => resolve(req.result?.data);
        req.onerror = () => reject(req.error);
    });
}
async function deleteData(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("cache", "readwrite");
        tx.objectStore("cache").delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "SAVE_CACHE") {
        saveData(msg.key, msg.value).then(() => {
            sendResponse({
                status: "save ok"
            });
        });
        return true; // giữ port mở
    }

    if (msg.type === "GET_CACHE") {
        getData(msg.key).then((data) => {
            sendResponse({
                status: "get ok",
                data
            });
        });
        return true;
    }

    if (msg.type === "DELETE_CACHE") {
        deleteData(msg.key).then(() => {
            sendResponse({
                status: "deleted"
            });
        });
        return true;
    }
});

var pref = {
    'shortcutToggle': false,
    'cssToggle': true,
    'version': chrome.runtime.getManifest().version
};

chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.get(Object.keys(pref)).then(toggle => {
        for (let key in toggle) {
            if (key in pref)
                pref[key] = toggle[key];
        }
        chrome.storage.local.set(pref);
    });
    // menu mở Tải repo
    const commonContexts = ["page", "selection", "link", "image"];
    const commonPatterns = [
        "*://*.drphe.github.io/KhoIPA/*",
        "*://*.kho-ipa.vercel.app/*",
        "chrome-extension://*/khoipa/*"
    ];

    const menus = [{
            id: "repo",
            title: "Tải repo editor"
        }, {
            id: "release",
            title: "New Release"
        }, {
            id: "note",
            title: "Note Builder"
        }, {
            id: "edit",
            title: "Edit Repo"
        }
    ];

    menus.forEach(menu => {
        chrome.contextMenus.create({
            id: menu.id,
            title: menu.title,
            contexts: commonContexts,
            documentUrlPatterns: commonPatterns
        });
    });

    // Đăng nhập tài khoản Vieon VIP
    chrome.contextMenus.create({
        id: "loadVieonAccounts",
        title: "🔑 Nạp tài khoản Vieon",
        contexts: ["action","page"],
        documentUrlPatterns: ["*://*.vieon.vn/*"]
    });
    // bảng gõ tắt
    chrome.contextMenus.create({
        id: "banggotat",
        title: "✏️ Soạn bảng gõ tắt...",
        contexts: ["action"]
    });
    // css
    chrome.contextMenus.create({
        id: "css",
        title: "✨ Giao diện tùy chỉnh CSS...",
        contexts: ["action"]
    });

});

// Truy cập trang web tài chính
chrome.action.onClicked.addListener(function (tab) {
    const url = "https://vnindex.vercel.app";
    chrome.tabs.create({
        url: url
    });
});

// Lắng nghe sự kiện click vào nút menu context
chrome.contextMenus.onClicked.addListener(async(info, tab) => {
    const menuUrls = {
        repo: "khoipa/index.html",
        note: "https://drphe.github.io/KhoIPA/studio/note.html",
        release: "https://github.com/drphe/KhoIPA/releases/new",
        edit: "https://drphe.github.io/KhoIPA/studio/?source=https://drphe.github.io/KhoIPA/upload/repo.favorite.json",
        banggotat: "shortcut/dashboard.html",
        css: "morecss/dashboard.html"

    };

    const url = menuUrls[info.menuItemId];
    if (url) {
        chrome.tabs.create({
            url
        });
    }
    if (info.menuItemId === "loadVieonAccounts") {
        // Mở popup.html trong một cửa sổ mới
        chrome.windows.create({
            url: 'vieon_helper/popup.html',
            type: 'popup',
            width: 500,
            height: 650
        });
    }

});

async function getISP() {
  try {
    const response = await fetch("https://speedtest.vn/get-ip-info");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return null;
  }
}

// Lắng nghe yêu cầu từ content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getISP") {
    getISP().then(isp => {
      sendResponse({ isp });
    });
    return true; // giữ kênh mở cho async
  }
});


