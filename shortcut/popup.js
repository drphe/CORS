// nhập xuất data từ file .json
document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.sync.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || {};
        const blob = new Blob([JSON.stringify(shortcuts, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "shortcuts_backup.json";
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
                shortcuts: importedShortcuts
            }, () => {
                loadShortcuts();
                alert("Import thành công!");
            });
        } catch (err) {
            alert("File không hợp lệ!");
        }
    };
    reader.readAsText(file);
});

// chức năng chính

let currentKey = null;

// Hiển thị danh sách shortcut
function renderList(shortcuts) {
    const listDiv = document.getElementById("list");
    listDiv.innerHTML = "";

    Object.entries(shortcuts).forEach(([key, value]) => {
        const item = document.createElement("div");
        item.className = "item";
        item.textContent = `${key} → ${value}`;
        item.addEventListener("click", () => {
            currentKey = key;
            document.getElementById("editKey").value = key;
            document.getElementById("editValue").value = value;
        });
        listDiv.appendChild(item);
    });
}

// Tải danh sách từ storage
function loadShortcuts() {
    chrome.storage.sync.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || {};
        renderList(shortcuts);
    });
}

// Lưu hoặc cập nhật shortcut
document.getElementById("saveBtn").addEventListener("click", () => {
    const newKey = document.getElementById("editKey").value.trim();
    const newValue = document.getElementById("editValue").value.trim();

    if (!newKey || !newValue) {
        alert("Không được để trống!");
        return;
    }

    // Lấy danh sách hiện tại rồi thêm hoặc cập nhật
    chrome.storage.sync.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || {};

        // Nếu đang sửa key cũ và đổi tên, xóa key cũ
        if (currentKey && currentKey !== newKey) {
            delete shortcuts[currentKey];
        }

        // Thêm hoặc cập nhật key mới
        shortcuts[newKey] = newValue;

        // Lưu lại danh sách mới
        chrome.storage.sync.set({
            shortcuts
        }, () => {
            currentKey = null;
            document.getElementById("editKey").value = "";
            document.getElementById("editValue").value = "";
            loadShortcuts();
        });
    });
});
document.getElementById("newBtn").addEventListener("click", () => {
    currentKey = null;
    document.getElementById("editKey").value = "";
    document.getElementById("editValue").value = "";
});

// Xóa shortcut đang chọn
document.getElementById("deleteBtn").addEventListener("click", () => {
    if (!currentKey) {
        alert("Chưa chọn shortcut để xóa!");
        return;
    }

    chrome.storage.sync.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || {};
        delete shortcuts[currentKey];

        chrome.storage.sync.set({
            shortcuts
        }, () => {
            currentKey = null;
            document.getElementById("editKey").value = "";
            document.getElementById("editValue").value = "";
            loadShortcuts();
        });
    });
});

// Toggle bảng gõ tắt

const toggle = document.getElementById("toggleShortcuts");
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
chrome.storage.sync.get("shortcutToggle", data => {
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
loadShortcuts();
setPanelEnabled(document.getElementById("toggleShortcuts").checked);
