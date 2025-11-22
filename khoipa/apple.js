setTimeout(()=>{
// 1. Tìm container và nút Share
const container = document.querySelector('.buttons-container');
const shareBtn = container?.querySelector('button[aria-label="Share"]');

// 2. Lấy ID từ URL hiện tại
const currentUrl = window.location.href;
const match = currentUrl.match(/id\d+/);
const appId = match ? match[0] : null;

// 3. Nếu có ID và có nút Share thì mới tạo nút Decrypt
if (appId && shareBtn && container) {
  // Nhân đôi nút Share
  const decryptBtn = shareBtn.cloneNode(true);

  // Đổi nhãn và aria-label
  decryptBtn.setAttribute('aria-label', 'Decrypt');
  decryptBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path d="M12 2a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v5h2v4h4v-4h2v-5a2 2 0 0 0-2-2H9V7a3 3 0 0 1 6 0v4h-1v2h4V7a5 5 0 0 0-5-5z"/>
    </svg>
    Decrypt
  `;

  // Gắn sự kiện click
  decryptBtn.addEventListener('click', () => {
    const targetUrl = `https://decrypt.day/app/${appId}`;
    window.open(targetUrl, '_blank');
  });

  // Thêm nút Decrypt vào container
  container.appendChild(decryptBtn);
}
}, 1000);
