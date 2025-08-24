var pref = {
    'shortcutToggle': false,
    'cssToggle': true,
    'version': chrome.runtime.getManifest().version
};

class Extension {
    // Biến để lưu trữ ID của tab chụp ảnh màn hình
    screenshotTabId = null;

    constructor() {
        this.initMessageListeners();
    }

    // Khởi tạo các listeners để nhận message từ các script khác
    initMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.method) {
                case "take_screen_shot":
                    this.screenShot(sendResponse);
                    break;
                case "get_pixel_color":
                    this.getPixelColor(request.point, sendResponse);
                    break;
                case "save_data":
                    this.saveData(request.config);
                    break;
                case "get_data":
                    this.getData(sendResponse);
                    break;
                case "open_options":
                    chrome.runtime.openOptionsPage();
                    break;
            }
            return true; // Để callback không bị garbage collected
        });
    }

    // Lấy màu pixel tại một điểm cụ thể trên trang
    async getPixelColor(point, sendResponse) {
        try {
            const imageDataUrl = await chrome.tabs.captureVisibleTab();
            const canvas = new OffscreenCanvas(1, 1);
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixelIndex = 4 * (point.y * imageData.width + point.x);
                const color = {
                    r: imageData.data[pixelIndex],
                    g: imageData.data[pixelIndex + 1],
                    b: imageData.data[pixelIndex + 2],
                    a: imageData.data[pixelIndex + 3],
                };

                sendResponse(color);
            };

            img.src = imageDataUrl;
        } catch (error) {
            console.error("Lỗi khi lấy màu pixel:", error);
            sendResponse(null);
        }
    }

    // Lưu dữ liệu vào local storage
    async saveData(config) {
        await chrome.storage.local.set({
            config
        });
    }

    // Lấy dữ liệu từ local storage
    async getData(sendResponse) {
        const data = await chrome.storage.local.get("config");
        sendResponse(data.config || null);
    }

    // Chèn CSS và JavaScript vào tab hiện tại
    async inject() {
        const [activeTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (activeTab) {
            try {
                await chrome.scripting.insertCSS({
                    target: {
                        tabId: activeTab.id
                    },
                    files: ["drawtool/panelTools.css"],
                });
                await chrome.scripting.executeScript({
                    target: {
                        tabId: activeTab.id
                    },
                    files: ["drawtool/panelTools.js"],
                });
            } catch (error) {
                console.table("Lỗi khi chèn script:", error);
            }
        }
    }

    // Chụp ảnh màn hình
    async screenShot(sendResponse) {
        const screenshotDataUrl = await chrome.tabs.captureVisibleTab();
        let screenshotTab = null;

        if (this.screenshotTabId) {
            screenshotTab = await chrome.tabs
                .get(this.screenshotTabId)
                .catch(() => null);
        }

        if (screenshotTab) {
            await chrome.tabs.update(screenshotTab.id, {
                active: true
            });
            this.updateScreenshot(screenshotDataUrl, sendResponse, 0, screenshotTab);
        } else {
            const newTab = await chrome.tabs.create({
                url: "drawtool/editor.html"
            });
            this.screenshotTabId = newTab.id;
            this.updateScreenshot(screenshotDataUrl, sendResponse, 0, newTab);
        }
    }

    // Gửi URL ảnh màn hình đến tab chỉnh sửa
    updateScreenshot(
        screenshotDataUrl,
        sendResponse,
        retries = 0,
        editorTab
    ) {
        if (retries > 10) return;

        chrome.runtime.sendMessage({
                method: "update_url",
                url: screenshotDataUrl
            },
            (response) => {
                if (response && response.success) {
                    sendResponse({
                        success: true
                    });
                } else {
                    setTimeout(() => {
                        this.updateScreenshot(
                            screenshotDataUrl,
                            sendResponse,
                            retries + 1,
                            editorTab
                        );
                    }, 300);
                }
            }
        );
    }

    // Cập nhật pop-up của extension
    async setWarning(popupUrl) {
        await chrome.action.setPopup({
            popup: popupUrl
        });
    }

}

// Khởi tạo class ngay khi extension được tải
const drawtool = new Extension();

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
    // vẽ trên trang
    chrome.contextMenus.create({
        id: "draw",
        title: "🎨 Công cụ vẽ",
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

    // Hướng dẫn sử dụng
    chrome.contextMenus.create({
        id: "open-guide",
        title: "📄 Hướng dẫn sử dụng",
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
    if (info.menuItemId === "draw") {
        drawtool.inject();
    }
});