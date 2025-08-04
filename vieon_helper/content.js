// Biến để lưu trữ các phần tử input và container gợi ý
let phoneInput = null;
let passwordInput = null;
let suggestionContainer = null;

// Hàm để tìm các ô input và gán các sự kiện
function findAndSetupFields() {
    // Tìm ô input số điện thoại
    const newPhoneInput = document.querySelector('input[id="userName"]');
    
    // Nếu tìm thấy ô input mới và nó khác với ô cũ, ta gán lại sự kiện
    if (newPhoneInput && newPhoneInput !== phoneInput) {
        // Gỡ bỏ sự kiện trên ô input cũ nếu có
        if (phoneInput) {
            phoneInput.removeEventListener('focus', showSuggestions);
            phoneInput.removeEventListener('click', showSuggestions);
        }
        
        phoneInput = newPhoneInput;
        
        // Tắt gợi ý mặc định của trình duyệt
        phoneInput.setAttribute('autocomplete', 'off');

        phoneInput.addEventListener('focus', showSuggestions);
        phoneInput.addEventListener('click', showSuggestions);

        // Thêm sự kiện để tự động điền mật khẩu sau khi nhấn "Bắt đầu"
        handleStartButton();
    }
}

// Hàm xử lý nút "Bắt đầu"
function handleStartButton() {
    const startButton = document.querySelector('button'); // Giả sử nút "Bắt đầu" là thẻ button.
    if (startButton) {
        // Tránh gán nhiều lần sự kiện click
        startButton.onclick = () => {
            // Đợi ô input mật khẩu xuất hiện
            const interval = setInterval(() => {
                passwordInput = document.querySelector('input[id="password"]');
                if (passwordInput) {
                    clearInterval(interval);
                    fillPassword();
                }
            }, 500); // Kiểm tra mỗi 500ms
        };
    }
}

// Hàm tự động điền mật khẩu
function fillPassword() {
    const enteredPhone = phoneInput.value;
    if (enteredPhone) {
        chrome.storage.local.get('vieonAccounts', (data) => {
            const accounts = data.vieonAccounts;
            const accountToFill = accounts.find(acc => acc.phone === enteredPhone);
            if (accountToFill && passwordInput) {
                passwordInput.value = accountToFill.password;
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }
}

// Hàm hiển thị danh sách gợi ý
function showSuggestions() {
    // Xóa gợi ý cũ nếu có
    if (suggestionContainer) {
        suggestionContainer.remove();
    }

    // Lấy dữ liệu từ storage
    chrome.storage.local.get('vieonAccounts', (data) => {
        const accounts = data.vieonAccounts;
        if (!accounts || accounts.length === 0) {
            return; // Không có tài khoản nào để gợi ý
        }

        // Tạo container cho gợi ý
        suggestionContainer = document.createElement('div');
        suggestionContainer.id = 'vieon-account-suggester';

        accounts.forEach(account => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            // Hiển thị SĐT và ngày hết hạn
            item.innerHTML = `
                <span class="phone">${account.phone}</span>
                <span class="expires">${account.expires}</span>
            `;

            // Xử lý khi chọn một tài khoản
            item.addEventListener('click', () => {
                if (phoneInput) {
                    phoneInput.value = account.phone;
                    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

                    // Xóa label sau khi điền số điện thoại
                    const labelToRemove = document.querySelector('label[for="userName"]');
                    if (labelToRemove) {
                        labelToRemove.remove();
                    }
                }
                suggestionContainer.remove(); // Ẩn danh sách sau khi chọn
            });
            suggestionContainer.appendChild(item);
        });

        // Chèn container vào trang, ngay dưới ô input
        document.body.appendChild(suggestionContainer);
        positionSuggestionBox();

        // Thêm sự kiện để đóng gợi ý khi click ra ngoài hoặc ấn phím Esc
        document.addEventListener('click', closeOnOutsideClick, true);
        document.addEventListener('keydown', closeOnEscape);
    });
}

// Định vị hộp gợi ý ngay dưới ô input SĐT
function positionSuggestionBox() {
    if (phoneInput && suggestionContainer) {
        const rect = phoneInput.getBoundingClientRect();
        suggestionContainer.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionContainer.style.left = `${rect.left + window.scrollX}px`;
        suggestionContainer.style.width = `${rect.width}px`;
    }
}

// Đóng hộp gợi ý khi click ra ngoài
function closeOnOutsideClick(event) {
    if (suggestionContainer && !suggestionContainer.contains(event.target) && event.target !== phoneInput) {
        suggestionContainer.remove();
        document.removeEventListener('click', closeOnOutsideClick, true);
        document.removeEventListener('keydown', closeOnEscape);
    }
}

// Đóng hộp gợi ý khi nhấn phím Esc
function closeOnEscape(event) {
    if (event.key === 'Escape' && suggestionContainer) {
        suggestionContainer.remove();
        document.removeEventListener('click', closeOnOutsideClick, true);
        document.removeEventListener('keydown', closeOnEscape);
    }
}

// Sử dụng MutationObserver để theo dõi sự thay đổi của DOM
const observer = new MutationObserver((mutationsList, observer) => {
    // Mỗi khi DOM thay đổi, ta kiểm tra lại và thiết lập lại các trường
    findAndSetupFields();
});

// Bắt đầu theo dõi các thay đổi trên toàn bộ body của trang
observer.observe(document.body, { childList: true, subtree: true });

// Chạy hàm thiết lập ban đầu khi script được tải lần đầu
findAndSetupFields();