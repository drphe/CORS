chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.allowCopy) {
    const newValue = changes.allowCopy.newValue;

    if (newValue) {
      // Kích hoạt tính năng copy
      document.oncontextmenu = null;
      document.onselectstart = null;
      document.onmousedown = null;
      document.body.oncontextmenu = null;
      document.body.onselectstart = null;
      document.body.onmousedown = null;

      document.querySelectorAll('*').forEach(el => {
        el.oncontextmenu = null;
        el.onselectstart = null;
        el.onmousedown = null;
        el.style.userSelect = 'text';
        el.style.pointerEvents = 'auto';
      });

      const clone = document.body.cloneNode(true);
      document.body.parentNode.replaceChild(clone, document.body);

      console.log("✅ Cho phép copy và chuột phải đã được bật.");
    } else {
      console.warn("⚠️ Tính năng bị tắt. Đang reload lại trang...");
      location.reload();
    }
  }
});
