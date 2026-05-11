document.addEventListener("DOMContentLoaded", () => {
const scriptTag = document.getElementById('compare-config');
if (scriptTag) {
    try {
        let config = JSON.parse(scriptTag.textContent);
        config.userTier = "pro";
        config.tierLimit = 99;
	config.saveLimit = 99;
	
        scriptTag.textContent = JSON.stringify(config, null, 4);
        
        console.log("Cập nhật cấu hình thành công!");
    } catch (e) {
        console.error("Lỗi khi đọc JSON:", e);
    }
} else {
    //console.error("Không tìm thấy thẻ script có ID 'compare-config'");
}
//== chức năng lọc víp
document.addEventListener("click", () => {
/// unlock chức năng lọc
  document.querySelectorAll("div.criterion-item").forEach(el => {
    el.classList.remove("criterion-locked");
    el.removeAttribute("data-modal-type");
  });

  // Xử lý các thẻ div có class="name pe-none"
  document.querySelectorAll("div.name.pe-none").forEach(el => {
    el.classList.remove("pe-none");
  });
// == unlock bộ lọc vip
 const elements = document.querySelectorAll('.smoney-locked');
  elements?.forEach(el => {
    el.classList.remove('smoney-locked');
    el.removeAttribute('data-modal-type');
  });
});
const accountStatus = document.querySelectorAll('.account-tier');
let status = 'Free';
accountStatus.forEach(e => {
e.classList.remove('account-tier--free');
e.classList.add('account-tier--pro');
status = e.textContent;
e.textContent = 'Pro';
});
if(status !== 'Free') alert("Cần đăng nhập để sử dụng đủ tính năng!")

});