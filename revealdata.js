const observer = new MutationObserver(() => {
  document.querySelectorAll('.MuiStack-root div, .DisablePointerChart').forEach(el => {
    const style = getComputedStyle(el);
    if (style.pointerEvents === 'none') {
      el.style.pointerEvents = 'auto';
      el.classList.remove('DisablePointerChart');
    }
    if (style.backdropFilter === 'blur(6px)' || style.getPropertyValue('backdrop-filter') === 'blur(6px)') {
      el.style.display = 'none';
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Xử lý khi click vào bất kỳ phần tử nào
document.addEventListener('click', event => {
  const el = event.target;
  const style = getComputedStyle(el);
  // Mở pointer-events nếu bị chặn
  if (style.pointerEvents === 'none') {
    el.style.pointerEvents = 'auto';
    el.classList.remove('DisablePointerChart');
  }
  if (style.backdropFilter === 'blur(6px)' || style.getPropertyValue('backdrop-filter') === 'blur(6px)') {
    el.style.display = 'none';
  }
  document.querySelectorAll('tr').forEach(tr => {
    if (getComputedStyle(tr).display === 'none') {
      tr.style.display = 'table-row';
    }
  });
});

