(function() {
    'use strict';
    let cssToggle = true;
    let cssList = []; // đổi sang mảng
    // Lấy CSS từ từ storage
    chrome.storage.sync.get(["morecss", "cssToggle"], (data) => {
        cssList = data.morecss || []; // luôn là mảng
        cssToggle = data.cssToggle;
        // Nếu bật toggle thì chèn CSS
        if (cssToggle) {
            const currentURL = window.location.href;
            const needInclude = cssList.find(item => currentURL.includes(item.url));
            if (needInclude?.css) {
                const style = document.createElement("style");
                style.textContent = needInclude.css;
                document.head.appendChild(style);
            }
            else {
                console.log("Không có CSS mở rộng");
            }
        }
    });

    const host = location.host; // lấy domain hiện tại
    const storageKey = `stopwatch_${host}`;
    let timerId = null;
    // Lấy giá trị đã lưu (nếu có)
    let seconds = parseInt(sessionStorage.getItem(storageKey) || '0', 10);

    const timerBox = document.createElement('div');
    timerBox.style.position = 'fixed';
    timerBox.style.bottom = '10px';
    timerBox.style.left = '10px';
    timerBox.style.padding = '8px 12px';
    timerBox.style.borderRadius = '6px';
    timerBox.style.fontFamily = 'monospace';
    timerBox.style.zIndex = '99999';
    timerBox.textContent = `00:00:00`;
    document.body.appendChild(timerBox);

    function applyTheme() {
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (darkMode) {
            timerBox.style.background = 'rgba(0,0,0,0.7)';
            timerBox.style.color = '#fff';
        } else {
            timerBox.style.background = 'rgba(255,255,255,0.9)';
            timerBox.style.color = '#000';
            timerBox.style.border = '1px solid #ccc';
        }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    applyTheme();

    function format(num) {
        return String(num).padStart(2, '0');
    }

    function updateTimer() {
        seconds++;
        sessionStorage.setItem(storageKey, seconds); // lưu lại mỗi giây
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const sec = seconds % 60;
        timerBox.textContent = `${format(hours)}:${format(minutes)}:${format(sec)}`;
    }
    function startTimer() {
        if (!timerId) {
            timerId = setInterval(updateTimer, 1000);
        }
    }

    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    // Theo dõi trạng thái tab
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    // Bắt đầu khi tab đang active
    if (!document.hidden) {
        startTimer();
    }

})();