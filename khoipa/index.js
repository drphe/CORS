     // Cấu hình Tailwind CSS để sử dụng Dark Mode dựa trên class 'dark'
     tailwind.config = {
       darkMode: 'class',
     }
     const overlay = document.getElementById('loading-overlay');
     const progressBar = document.getElementById('progress-bar');
     const progressText = document.getElementById('progress-text');
     const loadingTitle = document.getElementById('loading-title');
     let intervalId = null; // ID của setInterval để quản lý việc đếm tiến trình// lấy json repo từ cypwn
     function applySystemTheme() {
       // Lấy thẻ <html>
       const htmlElement = document.documentElement;
       const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
       if (prefersDark) {
         htmlElement.classList.add('dark');
       } else {
         htmlElement.classList.remove('dark');
       }
     }
     applySystemTheme();

     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);

     async function fetchScreenshotsForApps(apps, progressCallback) {
       let successCount = 0;
       let failureCount = 0;
       let processedCount = 0;
       const totalApps = apps.length;
       loadingTitle.textContent = `Đang tải ảnh chụp màn hình cho ${totalApps} ứng dụng...`;
       const tasks = apps.map(async (app) => {
         const bundleId = app.bundleIdentifier;
         const url = `https://ipa.thuthuatjb.com/view/lookimg.php?id=${bundleId}`;
         try {
           const response = await fetch(url);
           if (!response.ok) throw new Error(`Lỗi khi tải ${url}: ${response.status}`);
           const contentType = response.headers.get("content-type");
           if (!contentType || !contentType.includes("application/json")) {
             throw new Error(`Phản hồi không phải JSON từ ${url}`);
           }
           const json = await response.json();
           app.screenshotURLs = json.screenshotUrls || [];
           if (app.screenshotURLs.length > 0) {
             successCount++;
           } else {
             failureCount++;
           }
         } catch (error) {
           console.error(`Không thể lấy ảnh cho bundleID: ${bundleId}`);
           app.screenshotURLs = [];
           failureCount++;
         }
         processedCount++
         // Tính toán phần trăm tiến trình và báo cáo lại UI
         const progressPercentage = Math.min(100, Math.round((processedCount / totalApps) * 100));
         progressCallback(progressPercentage);
         if (processedCount % 10 === 0 || processedCount === totalApps) {
           console.log(`📦 Đã xử lý ${processedCount}/${totalApps} ứng dụng...`);
         }
       });
       // Chờ tất cả các tác vụ song song hoàn thành
       await Promise.all(tasks);
       console.log(`✅ Ảnh lấy thành công: ${successCount}`);
       console.log(`❌ Ảnh không lấy được: ${failureCount}`);
       // Đảm bảo tiến trình đạt 100% khi tất cả đã hoàn thành
       progressCallback(100);
     }

     function runTask(taskName, taskType, durationMs, data) {
       if (intervalId) {
         clearInterval(intervalId);
         intervalId = null;
       }
       loadingTitle.textContent = `Đang xử lý: ${taskName}`;
       progressBar.style.width = '0%';
       progressText.textContent = '0%';
       overlay.classList.add('active'); // Hiện overlay
       const updateProgressUI = (progress) => {
         progressBar.style.width = `${progress}%`;
         progressText.textContent = `${progress}%`;
         if (progress >= 100) {
           console.log(`Tác vụ ${taskName} đã hoàn thành.`);
           setTimeout(() => {
             overlay.classList.remove('active'); // Ẩn overlay
             loadingTitle.textContent = 'Đang Xử Lý...'; // Reset tiêu đề
           }, 500);
         }
       };
       if (taskType === 'ASYNC_TASK') {
         main(updateProgressUI, data)
       } 
     }

     async function main(updateProgressUI, source) { // lấy dữ liệu từ trang thuthuatjb
         if (!source.apps || !Array.isArray(data.apps)) {
           throw new Error("Dữ liệu không hợp lệ hoặc thiếu 'apps'");
         }
         console.log(`Bắt đầu lấy ảnh chụp màn hình cho ${source.apps.length} ứng dụng...`);
         await fetchScreenshotsForApps(source.apps, updateProgressUI);
         const fileName = "repo.thuthuatjb.json";
         initiateDownload(source, fileName);
     }


     function consolidateApps(source) { // sắp xếp lại dữ liệu
       const uniqueAppsMap = new Map();
       source.apps.forEach(app => {
         const bundleID = app.bundleIdentifier;
         // Tạo đối tượng phiên bản để gộp
         const firstVersion = app.versions?.[0] ?? {};
         const appDate = normalizeDateFormat(app.versionDate ?? firstVersion.date ?? "2025-01-01");
         const versionInfo = {
           version: app.version ?? firstVersion.version ?? "1.0.0",
           date: appDate,
           size: app.size ?? firstVersion.size ?? 0,
           downloadURL: app.downloadURL ?? firstVersion.downloadURL ?? "",
           localizedDescription: app.localizedDescription ?? firstVersion.localizedDescription ?? ""
         };
         if (uniqueAppsMap.has(bundleID)) {
           const existingApp = uniqueAppsMap.get(bundleID);
           if (appDate > existingApp.versionDate) {
             existingApp.versionDate = appDate;
             existingApp.version = app.version ?? firstVersion.version ?? "1.0.0";
             existingApp.downloadURL = app.downloadURL ?? firstVersion.downloadURL ?? "";
             existingApp.size = app.size ?? firstVersion.size ?? 0;
             existingApp.localizedDescription = app.localizedDescription ?? "";
           }
           existingApp.versions.push(versionInfo);
         } else {
           // Trường hợp duy nhất: Tạo đối tượng mới và thêm vào Map
           const newApp = {
             // Sao chép tất cả các trường không phải phiên bản
             beta: app.beta ?? false,
             name: app.name,
             type: app.type ?? 1,
             bundleIdentifier: app.bundleIdentifier,
             developerName: app.developerName ?? "",
             subtitle: app.subtitle ?? "",
             localizedDescription: app.localizedDescription ?? "",
             versionDescription: app.versionDescription ?? "",
             tintColor: app.tintColor ?? "00adef",
             iconURL: app.iconURL ?? "./common/assets/img/generic_app.jpeg",
             screenshotURLs: app.screenshotURLs ?? [],
             size: app.size ?? firstVersion.size ?? 0,
             version: app.version ?? firstVersion.version ?? "1.0.0",
             versions: app.versions ?? [versionInfo] ?? [],
             versionDate: appDate,
             downloadURL: app.downloadURL ?? firstVersion.downloadURL ?? ""
           };
           uniqueAppsMap.set(bundleID, newApp);
         }
       });
       // max 20 versions
       const consolidatedApps = Array.from(uniqueAppsMap.values());
       const MAX_VERSIONS = 20;
       consolidatedApps.forEach(app => {
         if (app.versions.length > MAX_VERSIONS) {
           app.versions = app.versions.slice(0, MAX_VERSIONS);
         }
       });
       const newSource = {
         ...source,
         apps: consolidatedApps
       };
       return newSource;
     }

     function normalizeDateFormat(dateStr) { // định dạng đúng ngày tháng
       const dmyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/; // dd-mm-yyyy
       const ymdRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/; // yyyy-mm-dd
       if (dmyRegex.test(dateStr)) {
         const [, day, month, year] = dateStr.match(dmyRegex);
         const dd = day.padStart(2, '0');
         const mm = month.padStart(2, '0');
         return `${year}-${mm}-${dd}`;
       } else if (ymdRegex.test(dateStr)) {
         const [, year, month, day] = dateStr.match(ymdRegex);
         const dd = day.padStart(2, '0');
         const mm = month.padStart(2, '0');
         return `${year}-${mm}-${dd}`;
       } else {
         return dateStr; // không hợp lệ
       }
     }

     document.getElementById('button1').addEventListener("click", (e) => {
	const url1 = 'https://drphe.github.io/KhoIPA/upload/repo.cypwn.json';
	const url2 = 'https://ipa.cypwn.xyz/cypwn.json';
	compareAndDownloadJSON(url1, url2, 'repo.cypwn.json'); 
     })
     document.getElementById('button2').addEventListener("click", (e) => {
	const url1 = 'https://drphe.github.io/KhoIPA/upload/repo.cypwn_ts.json';
	const url2 = 'https://ipa.cypwn.xyz/cypwn_ts.json';
	compareAndDownloadJSON(url1, url2, 'repo.cypwn_ts.json'); 
     })
     document.getElementById('button3').addEventListener("click", (e) => {
	const url1 = 'https://drphe.github.io/KhoIPA/upload/repo.nabzclan.json';
	const url2 = 'https://appstore.nabzclan.vip/repos/altstore.php';
	compareAndDownloadJSON(url1, url2, 'repo.nabzclan.json'); 
     })

     document.getElementById('button4').addEventListener("click", (e) => {
	const url1 = 'https://drphe.github.io/KhoIPA/upload/repo.nabzclan.json';
	const url2 = 'https://ipa.thuthuatjb.com/view/read.php';
	compareAndDownloadJSON(url1, url2, 'repo.thuthuatjb.json', true); 
     })

function compareAppLists(oldData, newData) {
    if (!oldData || !newData || !Array.isArray(oldData.apps) || !Array.isArray(newData.apps)) {
        return { newAppsCount: 0, newAppsList: [], removedAppsCount: 0, removedAppsList: [] };
    }

    const oldAppIdentifiers = new Set(oldData.apps.map(app => app.bundleIdentifier));
    const oldAppMap = new Map(oldData.apps.map(app => [app.bundleIdentifier, app]));

    const newApps = [];
    
    newData.apps.forEach(app => {
        if (!oldAppIdentifiers.has(app.bundleIdentifier)) {
            newApps.push({ name: app.name, bundleIdentifier: app.bundleIdentifier });
        }
        oldAppMap.delete(app.bundleIdentifier); // Loại bỏ những app còn tồn tại
    });

    const removedApps = Array.from(oldAppMap.values()).map(app => ({
        name: app.name,
        bundleIdentifier: app.bundleIdentifier
    }));

    return {
        newAppsCount: newApps.length,
        newAppsList: newApps,
        removedAppsCount: removedApps.length,
        removedAppsList: removedApps
    };
}


function initiateDownload(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

async function compareAndDownloadJSON(url1, url2, filename = 'new_version.json', isLoading = false) {
    try {
        const [res1, res2] = await Promise.all([
            fetch(url1),
            fetch(url2)
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();
	const data_new = consolidateApps(data2)
        const comparisonResult = compareAppLists(data1, data_new);
        displayComparisonModal(data_new, filename, comparisonResult, isLoading);

    } catch (err) {
        console.error(`Lỗi tải hoặc so sánh JSON:`, err);
        alert(`Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra console.`);
    }
}

function displayComparisonModal(dataToDownload, filename, result, loading) {
    const { newAppsCount, newAppsList, removedAppsCount, removedAppsList } = result;
    
    // Xây dựng nội dung bảng thông báo HTML
    let contentHTML = `<h2 class="text-xl">Update ${dataToDownload.name || 'Dữ liệu mới'}</h2>`;
    contentHTML += `<p>Phát hiện: <b>${dataToDownload.apps.length}</b> apps, trong đó <b>${newAppsCount}</b> ứng dụng mới và <b>${removedAppsCount}</b> ứng dụng bị xóa.</p>`;
        // Các nút Tải xuống/Hủy
    contentHTML += `
        <div>
            <button id="confirmDownload">✅ Tải xuống ${filename}</button>
            <button id="cancelDownload">❌ Hủy bỏ</button>
        </div>
    `;
    // Bảng chi tiết
    contentHTML += `
        <style>
            .comparison-modal-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .comparison-modal-table th, .comparison-modal-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .comparison-modal-table th { background-color: #f2f2f2; }
            .new-app { color: green; font-weight: bold; }
            .removed-app { color: red; text-decoration: line-through; }
        </style>
        <table class="comparison-modal-table">
            <thead>
                <tr>
                    <th>Trạng thái</th>
                    <th>Tên ứng dụng</th>
                    <th>Bundle Identifier</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Liệt kê ứng dụng mới
    newAppsList.forEach(app => {
        contentHTML += `<tr class="new-app"><td>➕ Mới</td><td>${app.name}</td><td>${app.bundleIdentifier}</td></tr>`;
    });

    // Liệt kê ứng dụng bị xóa
    removedAppsList.forEach(app => {
        contentHTML += `<tr class="removed-app"><td>➖ Bị xóa</td><td>${app.name}</td><td>${app.bundleIdentifier}</td></tr>`;
    });

    contentHTML += `
            </tbody>
        </table>
    `;

    // Tạo Modal (ví dụ đơn giản, bạn có thể thay thế bằng thư viện modal/dialog)
    const modal = document.createElement('div');
    modal.id = 'comparisonModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
    modalContent.innerHTML = contentHTML;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Xử lý sự kiện nút
    document.getElementById('confirmDownload').onclick = () => {
        if(loading) {
		runTask('Thuthuatjb', 'ASYNC_TASK', 0, dataToDownload);
	}else initiateDownload(dataToDownload, filename);
        modal.remove();
    };

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        modal.remove();
    }
});
    document.getElementById('cancelDownload').onclick = () => {
        modal.remove();
    };
}
