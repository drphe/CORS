// nhập xuất data từ file .json
document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.sync.get("morecss", (data) => {
        const morecss = data.morecss || {};
        const blob = new Blob([JSON.stringify(morecss, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "morecss_backup.json";
        a.click();
        URL.revokeObjectURL(url);
    });
});

document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const importedShortcuts = JSON.parse(reader.result);
            chrome.storage.sync.set({
                morecss: importedShortcuts
            }, () => {
                loadCSSs();
                alert("Import thành công!");
            });
        } catch (err) {
            alert("File không hợp lệ!");
        }
    };
    reader.readAsText(file);
});

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')        // Thay nhiều khoảng trắng liên tiếp bằng 1 dấu cách
    .trim();                     // Xóa khoảng trắng đầu và cuối chuỗi
}

// chức năng chính

let currentUrl = null;

// Hiển thị danh sách
function renderList(cssArray) {
    const listDiv = document.getElementById("list");
    listDiv.innerHTML = "";

    cssArray.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item";
        div.textContent = `${item.url} → ${item.css}`;
        div.addEventListener("click", () => {
            currentUrl = index; // lưu vị trí trong mảng
            document.getElementById("editUrl").value = item.url;
            document.getElementById("editValue").value = item.css;
        });
        listDiv.appendChild(div);
    });
}

// Load từ storage
function loadCSSs() {
    chrome.storage.sync.get("morecss", (data) => {
        const morecss = data.morecss || [];
        renderList(morecss);
    });
}

// Lưu hoặc cập nhật
document.getElementById("saveBtn").addEventListener("click", () => {
    const newUrl = document.getElementById("editUrl").value.trim();
    const newValue = cleanText(document.getElementById("editValue").value);

    if (!newUrl || !newValue) {
        alert("Không được để trống!");
        return;
    }

    chrome.storage.sync.get("morecss", (data) => {
        let morecss = data.morecss || [];

        if (currentUrl !== null) {
            // sửa phần tử cũ
            morecss[currentUrl] = { url: newUrl, css: newValue };
        } else {
            // thêm mới
            morecss.push({ url: newUrl, css: newValue });
        }

        chrome.storage.sync.set({ morecss }, () => {
            currentUrl = null;
            document.getElementById("editUrl").value = "";
            document.getElementById("editValue").value = "";
            loadCSSs();
            console.log(morecss);
        });
    });
});


document.getElementById("newBtn").addEventListener("click", () => {
    currentUrl = null;
    document.getElementById("editUrl").value = "";
    document.getElementById("editValue").value = "";
});

// Xóa shortcut đang chọn
document.getElementById("deleteBtn").addEventListener("click", () => {
    if (!currentUrl) {
        alert("Chưa chọn shortcut để xóa!");
        return;
    }

    chrome.storage.sync.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || {};
        delete shortcuts[currentUrl];

        chrome.storage.sync.set({
            shortcuts
        }, () => {
            currentUrl = null;
            document.getElementById("editUrl").value = "";
            document.getElementById("editValue").value = "";
            loadCSSs();
        });
    });
});

// Toggle bảng gõ tắt

const toggle = document.getElementById("toggleCss");
const panel = document.getElementById("shortcutPanel");

// Hàm bật/tắt các input và button
function setPanelEnabled(enabled) {
    const elements = panel.querySelectorAll("input, button, textarea");
    elements.forEach(el => {
        el.disabled = !enabled;
        el.style.opacity = enabled ? "1" : "0.6";
        el.style.pointerEvents = enabled ? "auto" : "none";
    });
}

// Lưu trạng thái vào storage
function saveToggleState(state) {
    chrome.storage.sync.set({
        shortcutToggle: state
    });
}

// Đọc trạng thái từ storage khi khởi động
chrome.storage.sync.get("cssToggle", data => {
    const isEnabled = data.shortcutToggle ?? true;
    toggle.checked = isEnabled;
    setPanelEnabled(isEnabled);
});

// Xử lý khi người dùng thay đổi toggle
toggle.addEventListener("change", () => {
    const isEnabled = toggle.checked;
    setPanelEnabled(isEnabled);
    saveToggleState(isEnabled);
    console.log(isEnabled)
});


// Khởi động
loadCSSs();
setPanelEnabled(document.getElementById("toggleCss").checked);