(function() {
function convertAppleUrlToArm(url) {
  const pattern = /^https:\/\/apps\.apple\.com\/(.*)$/;
  const match = url.match(pattern);
  if (match) {
    return "https://armconverter.com/decryptedappstore/" + match[1];
  }
  return null;
}

setTimeout(() => {
  const container = document.querySelector('.buttons-container');
  const shareBtn = container?.querySelector('button.with-label');

  const currentUrl = window.location.href;
  const match = currentUrl.match(/id\d+/);
  const appId = match ? match[0] : null;

  if (appId && shareBtn && container) {
    // --- Nút Decrypt ---
    const decryptBtn = shareBtn.cloneNode(true);
    decryptBtn.setAttribute('aria-label', 'Decrypt');
    decryptBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
        <path d="M12 2a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v5h2v4h4v-4h2v-5a2 2 0 0 0-2-2H9V7a3 3 0 0 1 6 0v4h-1v2h4V7a5 5 0 0 0-5-5z"/>
      </svg>
      Decrypt
    `;
    decryptBtn.addEventListener('click', () => {
      const targetUrl = `https://decrypt.day/app/${appId}`;
      window.open(targetUrl, '_blank');
    });
    container.appendChild(decryptBtn);

    // --- Nút Armconverter ---
    const armBtn = shareBtn.cloneNode(true);
    armBtn.setAttribute('aria-label', 'Armconverter');
    armBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 4l-5 5h3v4h4v-4h3l-5-5z"/>
      </svg>
      Armconverter
    `;
    armBtn.addEventListener('click', () => {
      const targetUrl = convertAppleUrlToArm(currentUrl);
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      } else {
        alert("Không phải link App Store hợp lệ!");
      }
    });
    container.appendChild(armBtn);
  }
}, 1000);
})();
