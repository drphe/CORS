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

     function runTask(taskName, taskType, durationMs) {
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
         main(updateProgressUI)
       } else if (taskType === 'SIMULATED') {
         downloadJSON('https://ipa.cypwn.xyz/cypwn.json', 'repo.cypwn.json');
         downloadJSON('https://ipa.cypwn.xyz/cypwn_ts.json', 'repo.cypwn_ts.json');
         downloadJSON('https://appstore.nabzclan.vip/repos/altstore.php', 'repo.nabzclan.json');
	
         let progress = 0;
         const steps = 10; // Số bước (10%, 20%, ..., 100%)
         const stepDuration = durationMs / steps;
         intervalId = setInterval(() => {
           progress += 10;
           // Cập nhật UI
           updateProgressUI(progress);
           // 3. Xử lý khi đạt 100%
           if (progress >= 100) {
             clearInterval(intervalId); // Dừng bộ đếm
           }
         }, stepDuration);
       }
     }

     function downloadJSON(url, filename) {
       fetch(url).then(res => res.json()).then(data => {
         const jsonStr = JSON.stringify(data, null, 2);
         const blob = new Blob([jsonStr], {
           type: 'application/json'
         });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(blob);
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(link.href);
       }).catch(err => console.error(`Lỗi tải ${filename}:`, err));
     }
     async function main(updateProgressUI) { // lấy dữ liệu từ trang thuthuatjb
       let url = 'https://ipa.thuthuatjb.com/view/read.php';
       try {
         const response = await fetch(url);
         if (!response.ok) {
           throw new Error(`Lỗi khi tải dữ liệu ban đầu: ${response.status} ${response.statusText}`);
         }
         const data = await response.json();
         if (!data.apps || !Array.isArray(data.apps)) {
           throw new Error("Dữ liệu không hợp lệ hoặc thiếu 'apps'");
         }
         console.log(`Sắp xếp lại dữ liệu...`);
         const source = consolidateApps(data);
         console.log(`Bắt đầu lấy ảnh chụp màn hình cho ${source.apps.length} ứng dụng...`);
         await fetchScreenshotsForApps(source.apps, updateProgressUI);
         const fileName = "repo.thuthuatjb.json";
         downloadJsonFile(source, fileName);
       } catch (error) {
         console.error("❌ Lỗi khi tải dữ liệu ban đầu hoặc xử lý:", error);
       }
     }

     function downloadJsonFile(data, filename = 'updated_repo.json') { // tải file xuống
       const jsonString = JSON.stringify(data, null, 2);
       const blob = new Blob([jsonString], {
         type: 'application/json'
       });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename; // Đặt tên file
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       console.log(`✅ Đã kích hoạt tải xuống file: ${filename}`);
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
       runTask('Cypwn', 'SIMULATED', 4000)
     })
     document.getElementById('button3').addEventListener("click", (e) => {
       runTask('Thuthuatjb', 'ASYNC_TASK', 0)
     })
