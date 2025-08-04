document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');
    const dataInput = document.getElementById('dataInput');
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');

    const url = 'https://raw.githubusercontent.com/drphe/data/main/vieon.txt';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Thay 'myTextarea' bằng id của textarea của bạn
            const textarea = document.getElementById('dataInput');
            if (textarea) {
                textarea.value = data;
            } else {
                console.error('Không tìm thấy textarea với id "myTextarea".');
            }
        })
        .catch(error => {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu:', error);
        });

    // Xử lý khi chọn file
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dataInput.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Xử lý khi nhấn nút Lưu
    saveButton.addEventListener('click', () => {
        const rawData = dataInput.value.trim();
        if (!rawData) {
            status.textContent = 'Lỗi: Không có dữ liệu để lưu.';
            status.style.color = 'red';
            return;
        }

        // Lấy dữ liệu cũ để kiểm tra
        chrome.storage.local.get(['vieonAccounts'], (result) => {
            const existingAccounts = result.vieonAccounts;

            // Nếu có dữ liệu cũ, hỏi người dùng trước khi ghi đè
            if (existingAccounts && existingAccounts.length > 0) {
                if (confirm('Đã có dữ liệu tài khoản VieON. Bạn có muốn cập nhật dữ liệu mới không? Dữ liệu cũ sẽ bị xóa.')) {
                    processAndSaveData(rawData);
                } else {
                    status.textContent = 'Đã hủy cập nhật dữ liệu.';
                    status.style.color = 'orange';
                }
            } else {
                // Nếu chưa có dữ liệu cũ, lưu thẳng
                processAndSaveData(rawData);
            }
        });
    });

    function processAndSaveData(rawData) {
        const lines = rawData.split('\n');
        let accounts = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Hàm chuyển đổi ngày tháng 'dd/mm/yyyy' sang đối tượng Date
        const parseDate = (dateStr) => {
            const parts = dateStr.split('/');
            // new Date(year, monthIndex, day)
            return new Date(parts[2], parts[1] - 1, parts[0]);
        };

        lines.forEach(line => {
            if (line.trim() === '') return;

            try {
                const parts = line.split('|');
                const credentials = parts[0].split(':');
                const expiryPart = parts[2];
                
                const phone = credentials[0].trim();
                const password = credentials.slice(1).join(':').trim();
                const expiryText = expiryPart.substring(expiryPart.indexOf('[') + 1, expiryPart.indexOf(']')).trim();
                
                // Bỏ qua các tài khoản đã "hủy gia hạn"
                if (expiryText.toLowerCase().includes('hủy gia hạn')) {
                    return; 
                }

                const expiryDate = parseDate(expiryText);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Chỉ lấy các tài khoản còn VIP (số ngày còn lại >= 0)
                if (diffDays >= 0) {
                    accounts.push({
                        phone: phone,
                        password: password,
                        expires: `${expiryText} (${diffDays} ngày còn lại)`
                    });
                }

            } catch (e) {
                console.warn("Bỏ qua dòng không đúng định dạng:", line);
            }
        });

        // Loại bỏ các tài khoản trùng lặp dựa trên 'phone'
        const uniqueAccounts = Array.from(new Map(accounts.map(account => [account.phone, account])).values());
        
        // Sắp xếp tài khoản và lưu
        sortAndSaveAccounts(uniqueAccounts);
    }

    function sortAndSaveAccounts(accounts) {
        // Hàm chuyển đổi ngày tháng 'dd/mm/yyyy' sang đối tượng Date
        const parseDate = (dateStr) => {
            // Cần trích xuất lại ngày tháng từ chuỗi đã được thêm số ngày
            const dateOnly = dateStr.split(' ')[0];
            const parts = dateOnly.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        };
        
        // Sắp xếp: từ xa đến gần
        accounts.sort((a, b) => {
            const dateA = parseDate(a.expires);
            const dateB = parseDate(b.expires);
            return dateB - dateA; // Sắp xếp giảm dần
        });
        
        // Lưu vào bộ nhớ của tiện ích
        chrome.storage.local.set({ vieonAccounts: accounts }, () => {
            status.textContent = `Đã lưu thành công ${accounts.length} tài khoản VIP!`;
            status.style.color = 'green';
            
            // Tự động đóng popup và load lại trang sau 2 giây
            setTimeout(() => {
                chrome.tabs.query({url: "https://vieon.vn/*"}, function(tabs) {
                    if (tabs.length > 0) {
                        chrome.tabs.update(tabs[0].id, {url: "https://vieon.vn/auth/?destination=/&page=/"});
                    }
                });
                window.close();
            }, 2000);
        });
    }
});