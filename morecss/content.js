let cssToggle = true;
let cssList = []; // đổi sang mảng

// Lấy dữ liệu ban đầu từ storage
chrome.storage.sync.get(["morecss", "cssToggle"], (data) => {
    cssList = data.morecss || [];   // luôn là mảng
    cssToggle = data.cssToggle;

    // Nếu bật toggle thì chèn CSS
    if (cssToggle) {
        const currentURL = window.location.href;
        const needInclude = cssList.find(item => currentURL.includes(item.url));

        if (needInclude?.css) {
            const style = document.createElement("style");
            style.textContent = needInclude.css;
            document.head.appendChild(style);
        } else {
            console.log("Không có CSS mở rộng");
        }
    }
});
