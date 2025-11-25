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
    'allowCopy': false,
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

    // menu mở Wichart
    chrome.contextMenus.create({
        id: "wichart",
        title: "Mở Wichart",
        contexts: ["page", "selection", "link", "image"],
        documentUrlPatterns: ["*://*.drphe.github.io/BM/*"]
    });

    // Đăng nhập tài khoản Vieon VIP
    chrome.contextMenus.create({
        id: "loadVieonAccounts",
        title: "Nạp tài khoản Vieon",
        contexts: ["page"],
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
    chrome.contextMenus.create({
        title: pref.allowCopy ? "✅ Đã bật SupperCopy" : "❌ Không dùng SupperCopy",
        id: 'allowCopy',
        contexts: ["action"]
    })
    // Hướng dẫn sử dụng
    chrome.contextMenus.create({
        id: "guide",
        title: "📄 Hướng dẫn sử dụng",
        contexts: ["action"]// Hiển thị khi nhấp chuột phải vào biểu tượng extension
    });
});

// Truy cập trang web tài chính
chrome.action.onClicked.addListener(function (tab) {
    const url = "https://drphe.github.io/BM/vnindex";
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
        wichart: "https://wichart.vn",
        banggotat: "shortcut/dashboard.html",
        css: "morecss/dashboard.html",
        guide: "https://drphe.github.io/BM/hdsd.html"

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
    if (info.menuItemId === 'allowCopy') {
        pref.allowCopy = !pref.allowCopy
            await chrome.storage.local.set(pref);
        await chrome.contextMenus.update("allowCopy", {
            title: pref.allowCopy ? "✅ Đã bật SupperCopy" : "❌ Không dùng SupperCopy",
        });
    }

});