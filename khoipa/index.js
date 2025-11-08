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

async function fetchScreenshotsForAppsNab(apps, progressCallback) {// nabzclan
  let successCount = 0;
  let failureCount = 0;
  let processedCount = 0;
  const totalApps = apps.length;

  loadingTitle.textContent = `Đang tải ảnh chụp màn hình cho ${totalApps} ứng dụng...`;

  const tasks = apps.map(async (app) => {
    const bundleId = app.bundleIdentifier;
    const url = app.download_page_url;

    try {
      const res = await fetch(url);
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const anchors = doc.querySelectorAll('a[href*="screenshots/"]');
      const screenShotURL = new Set();

      anchors.forEach(a => {
        const href = a.getAttribute("href");
        if (href) screenShotURL.add(href);

        const img = a.querySelector("img");
        if (img && img.dataset.src) {
          screenShotURL.add(img.dataset.src);
        }
      });

      app.screenshotURLs = [...screenShotURL];

      if (app.screenshotURLs.length > 0) {
        successCount++;
      } else {
        failureCount++;
      }
    } catch (err) {
      console.error(`❌ Không thể lấy ảnh cho bundleID: ${bundleId}`, err);
      app.screenshotURLs = [];
      failureCount++;
    }

    processedCount++;
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

     async function fetchScreenshotsForAppsThuthuatjb(apps, progressCallback) {// thuthuatjb
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
           //console.log(`Tác vụ ${taskName} đã hoàn thành.`);
           setTimeout(() => {
             overlay.classList.remove('active'); // Ẩn overlay
             loadingTitle.textContent = 'Đang Xử Lý...'; // Reset tiêu đề
           }, 500);
         }
       };
       if (taskType === 'THUTHUATJB_TASK') {
         mainThuthuatjb(updateProgressUI, data)
       } else if (taskType === 'NABZCLAN_TASK') {
         mainNab(updateProgressUI, data)
       } else {
	  let i = 0;
  	const intervalMs = durationMs / 100;

  	const interval = setInterval(() => {
    		updateProgressUI(i); 
    		i++;

    		if (i > 100) {
      			clearInterval(interval); 
   	 }
  	}, intervalMs);

	}
     }

     async function mainThuthuatjb(updateProgressUI, source) { // lấy dữ liệu từ trang thuthuatjb
         if (!source.apps || !Array.isArray(source.apps)) {
           throw new Error("Dữ liệu không hợp lệ hoặc thiếu 'apps'");
         }
         console.log(`Bắt đầu lấy ảnh chụp màn hình cho ${source.apps.length} ứng dụng...`);
         await fetchScreenshotsForAppsThuthuatjb(source.apps, updateProgressUI);
         const fileName = "repo.thuthuatjb.json";
         initiateDownload(source, fileName);
     }

     async function mainNab(updateProgressUI, source) { // lấy dữ liệu từ trang thuthuatjb
         if (!source.apps || !Array.isArray(source.apps)) {
           throw new Error("Dữ liệu không hợp lệ hoặc thiếu 'apps'");
         }
         console.log(`Bắt đầu lấy ảnh chụp màn hình cho ${source.apps.length} ứng dụng...`);
         await fetchScreenshotsForAppsNab(source.apps, updateProgressUI);
         const fileName = "repo.nabzclan.json";
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
	     screenshots : app.screenshots ?? [],
             appPermissions: app.appPermissions ?? {"entitlements": [],"privacy": {}},
             size: app.size ?? firstVersion.size ?? 0,
             version: app.version ?? firstVersion.version ?? "1.0.0",
             versions: app.versions ?? [versionInfo] ?? [],
             versionDate: appDate,
             downloadURL: app.downloadURL ?? firstVersion.downloadURL ?? "",
	     patreon:app.patreon ?? {},
             download_page_url : app.download_page_url??""
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
        newSource.META ||= {repoName: newSource.name,repoIcon: newSource.iconURL};
        newSource.sourceImage ||= newSource.iconURL;
        newSource.sourceURL ||= "https://drphe.github.io/KhoIPA/upload/";
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

const repoConfigs = [
  { buttonId: 'button1', url1: 'https://drphe.github.io/KhoIPA/upload/repo.cypwn.json', url2: 'https://ipa.cypwn.xyz/cypwn.json', filename: 'repo.cypwn.json' },
  { buttonId: 'button2', url1: 'https://drphe.github.io/KhoIPA/upload/repo.cypwn_ts.json', url2: 'https://ipa.cypwn.xyz/cypwn_ts.json', filename: 'repo.cypwn_ts.json' },
  { buttonId: 'button3', url1: 'https://drphe.github.io/KhoIPA/upload/repo.nabzclan.json', url2: 'https://appstore.nabzclan.vip/repos/altstore.php', filename: 'repo.nabzclan.json'},
  { buttonId: 'button4', url1: 'https://drphe.github.io/KhoIPA/upload/repo.thuthuatjb.json', url2: 'https://ipa.thuthuatjb.com/view/read.php', filename: 'repo.thuthuatjb.json' },
];

repoConfigs.forEach(({ buttonId, url1, url2, filename }) => {
  document.getElementById(buttonId)?.addEventListener("click", () => {
    compareAndDownloadJSON(url1, url2, filename);
  });
});

document.getElementById('button6')?.addEventListener("click", async () => { 
   runTask("Check", "ALL_REPO", 3000, {});
  const result = [];
  for (const { url1, url2, filename} of repoConfigs) {
    const re = await compareAndDownloadJSON(url1, url2, filename, false);
    result.push(re);
  }
  overlay.classList.remove('active'); // Ẩn overlay
  loadingTitle.textContent = 'Đang Xử Lý...'; // Reset tiêu đề
  displayComparisonModalMultiResult(result);
});



function compareAppLists(oldData, newData) {
    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!oldData || !newData || !Array.isArray(oldData.apps) || !Array.isArray(newData.apps)) {
        console.error("Dữ liệu đầu vào không hợp lệ hoặc thiếu mảng 'apps'.");
        return { 
            newAppsCount: 0, newAppsList: [], 
            removedAppsCount: 0, removedAppsList: [],
            updatedAppsCount: 0, updatedAppsList: []
        };
    }

    // Tạo Map từ dữ liệu cũ để tra cứu nhanh chóng và lưu trữ toàn bộ đối tượng
    const oldAppMap = new Map();
    oldData.apps.forEach(app => {
        // Đảm bảo versions là một mảng, nếu không có thì gán mảng rỗng
        app.versions = Array.isArray(app.versions) ? app.versions : [];
        oldAppMap.set(app.bundleIdentifier, app);
    });

    const newApps = [];
    const updatedApps = [];
    
    // 2. Lặp qua danh sách ứng dụng mới để tìm ứng dụng mới và ứng dụng có phiên bản mới
    newData.apps.forEach(newApp => {
        // Đảm bảo versions trong dữ liệu mới cũng là một mảng
        newApp.versions = Array.isArray(newApp.versions) ? newApp.versions : [];
        const bundleId = newApp.bundleIdentifier;
        const oldApp = oldAppMap.get(bundleId);

        if (!oldApp) {
            // A. Ứng dụng mới (Chỉ có trong newData)
            newApps.push({ 
                name: newApp.name, 
                bundleIdentifier: bundleId 
            });
        } else {
            // B. Ứng dụng đã tồn tại, kiểm tra phiên bản mới
            const oldVersions = oldApp.versions;
            const newVersions = newApp.versions;

            if (newVersions.length > oldVersions.length) {
                // Phiên bản được cập nhật (mảng versions dài hơn)
                const latestOldVersion = oldVersions[oldVersions.length - 1] || 'N/A';
                const latestNewVersion = newVersions[newVersions.length - 1] || 'N/A';

                updatedApps.push({
                    name: newApp.name,
                    bundleIdentifier: bundleId,
                    // Thêm thông tin chi tiết về phiên bản để người dùng dễ theo dõi
                    oldVersionCount: oldVersions.length,
                    newVersionCount: newVersions.length,
                    latestOldVersion: latestOldVersion,
                    latestNewVersion: latestNewVersion,
                });
            }
            
            // Xóa ứng dụng khỏi map cũ để chỉ còn lại những ứng dụng bị xóa
            oldAppMap.delete(bundleId); 
        }
    });

    // 3. Các ứng dụng còn lại trong oldAppMap là ứng dụng đã bị xóa
    const removedApps = Array.from(oldAppMap.values()).map(app => ({
        name: app.name,
        bundleIdentifier: app.bundleIdentifier
    }));

    // 4. Trả về kết quả thống kê đầy đủ
    return {
        newAppsCount: newApps.length,
        newAppsList: newApps,
        
        removedAppsCount: removedApps.length,
        removedAppsList: removedApps,

        updatedAppsCount: updatedApps.length,
        updatedAppsList: updatedApps,
    };
}


function initiateDownload(data, filename) {

data.apps.forEach(obj => {
  delete obj.download_page_url;
});

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

async function compareAndDownloadJSON(url1,url2,filename = 'new_version.json',isDisplay = true) {
  try {
    const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
    if (!res1.ok || !res2.ok) {
      throw new Error(`Lỗi HTTP: ${res1.status} hoặc ${res2.status}`);
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    const data_new = consolidateApps(data2);
    const comparisonResult = compareAppLists(data1, data_new);

    if (!isDisplay) {
      return {
        data: data_new,
        filename,
        comparisonResult
      };
    }

    displayComparisonModal(data_new, filename, comparisonResult);
  } catch (err) {
    console.error('Lỗi tải hoặc so sánh JSON:', err);
    alert('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra console.');
  }
}

function displayComparisonModalMultiResult(results) {
  let contentHTML = `<h2 class="text-xl">📦 Tổng quan cập nhật các Repo</h2><div style="  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 cột */
  gap: 10px;">`;

  results.forEach(({ data, filename, comparisonResult }, index) => {
     const newAppsCount = comparisonResult.newAppsCount;
  const removedAppsCount = comparisonResult.removedAppsCount;
  const updatedAppsCount = comparisonResult.updatedAppsCount;

    contentHTML += `
      <div style="border: 1px solid #ccc; padding: 15px; margin: 15px 0; border-radius: 6px;">
        <h3 style="margin-bottom: 8px;">🔹 <b>${data.name || filename}</b></h3>
        <ul style="list-style: none; padding-left: 0; font-size: 15px;">
          <li>📱 Tổng số ứng dụng: <b>${data.apps.length}</b></li>
          <li>🆕 Ứng dụng mới: <b style="color: green;">${newAppsCount}</b></li>
          <li>⬆️ Cập nhật: <b style="color: orange;">${updatedAppsCount}</b></li>
          <li>❌ Bị xóa: <b style="color: red;">${removedAppsCount}</b></li>
        </ul>
        <button class="download-btn" data-index="${index}" style="margin-top: 10px;">✅ Tải xuống ${filename}</button>
      </div>
    `;
  });

  contentHTML += `</div><div style="text-align: right;"><button id="cancelDownload">❌ Đóng</button></div>`;

  // Tạo Modal
  const modal = document.createElement('div');
  modal.id = 'comparisonModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 10;
    display: flex; justify-content: center; align-items: center;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white; padding: 20px; border-radius: 8px;
    max-width: 600px; width: 90%; max-height: 90%; overflow-y: auto;
    font-family: sans-serif;
  `;
  modalContent.innerHTML = contentHTML;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Gán sự kiện cho từng nút tải xuống
  modal.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'));
      const { data, filename } = results[index];

      if (filename === "repo.nabzclan.json") {
        runTask('Nabzclan', 'NABZCLAN_TASK', 0, data);
      } else if (filename === "repo.thuthuatjb.json") {
        runTask('Thuthuatjb', 'THUTHUATJB_TASK', 0, data);
      } else {
        initiateDownload(data, filename);
      }

      //modal.remove();
    });
  });

  // Đóng modal bằng phím Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modal.remove();
    }
  });

  // Nút hủy
  document.getElementById('cancelDownload').onclick = () => {
    modal.remove();
  };
}


function displayComparisonModal(dataToDownload, filename, result) {
    const { newAppsCount, newAppsList, removedAppsCount, removedAppsList, updatedAppsCount, updatedAppsList } = result;
    
    // Xây dựng nội dung bảng thông báo HTML
    let contentHTML = `<h2 class="text-xl">Update ${dataToDownload.name || 'Dữ liệu mới'}</h2>`;
    contentHTML += `<p>Phát hiện: <b>${dataToDownload.apps.length}</b> apps, trong đó <b>${newAppsCount}</b> ứng dụng mới, <b>${removedAppsCount}</b> ứng dụng bị xóa và <b>${updatedAppsCount}</b> ứng dụng có bản update.</p>`;
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
    // Liệt kê ứng dụng được update
    updatedAppsList.forEach(app => {
        contentHTML += `<tr class="new-app"><td>⬆️ Cập nhật</td><td>${app.name}</td><td>${app.bundleIdentifier}</td></tr>`;
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
	if(filename == "repo.nabzclan.json") runTask('Nabzclan', 'NABZCLAN_TASK', 0, dataToDownload);
	else if(filename == "repo.thuthuatjb.json") runTask('Thuthuatjb', 'THUTHUATJB_TASK', 0, dataToDownload);
	else initiateDownload(dataToDownload, filename);
        //modal.remove();
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


(() => {
 const button = document.getElementById('button5');
  // Tạo input file ẩn
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);

  // Khi click nút, kích hoạt chọn file
  button.onclick = () => {
    input.click();
  };

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return console.log('Chưa chọn ảnh.');

    // Hiệu ứng loading
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Đang tải lên...';

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('https://api.imgbb.com/1/upload?key=382cf5a0a2e43717f1205d5fce4ccede', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
     if(result.success){
      const link = result.data.url;
      console.log('Kết quả trả về:', result);
      // Sao chép vào clipboard
      await navigator.clipboard.writeText(link);
      alert('Đã sao chép link vào clipboard:\n' + link);
	} else {
      alert('Không upload được ảnh');
	}
    } catch (err) {
      console.error('Lỗi upload:', err);
      alert('Lỗi khi tải ảnh lên.');
    } finally {
      // Khôi phục nút
      button.disabled = false;
      button.textContent = originalText;
      input.value = ''; // reset input
    }
  };
})();
