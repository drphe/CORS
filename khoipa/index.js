const jsonData = {
    "name": "Unkeyapp Store",
    "identifier": "com.unkeyapp.store",
    "subtitle": "Unkeyapp – kho ứng dụng bên thứ ba",
    "description": "Unkeyapp - Kho ứng dụng bên thứ ba.",
    "iconURL": "https://i.ibb.co/chdc4gB1/d07036ead96f.png",
    "website": "https://www.unkeyapp.com/app-store",
    "sourceURL": "https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.unkeyapp.json",
    "tintColor": "0cabeb",
    "featuredApps": [],
    "apps": [],
    "news": [{
        "title": "Welcome to Unkeyapp Store Repo!",
        "identifier": "unkeyapp.public.init",
        "caption": "Tap to open our App Store",
        "date": "2025-11-20",
        "tintColor": "#0cabeb",
        "imageURL": "https://i.ibb.co/hFypCsBL/1750296767052-IMG-5587.jpg",
        "notify": true,
        "url": "https://www.unkeyapp.com/app-store",
        "appID": null
    }]
}
const jsonFile = {
    "name": "Build Store",
    "identifier": "io.build.store",
    "subtitle": "BuildStore – safe and trustworthy app store for iOS",
    "description": "BuildStore – safe and trustworthy app store for iOS",
    "iconURL": "https://raw.githubusercontent.com/drphe/KhoIPA/main/icon/buildstore.png",
    "website": "https://builds.io/explore",
    "sourceURL": "https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.buildstore.json",
    "tintColor": "3c2474",
    "featuredApps": [],
    "apps": [],
  "news": [
    {
      "title": "New Year Sale!",
      "identifier": "news-i1krpao8oc",
      "caption": "50% off 6-month & annual plans.",
      "date": "2026-01-06",
      "tintColor": "#2b1141",
      "imageURL": "https://i.ibb.co/kgq5wkP6/5f6e569b24fe.png",
      "notify": true,
      "url": "https://builds.io/payment/checkout",
      "appID": null
    },
    {
      "title": "Welcome to Build Store Repo!",
      "identifier": "buildstore.public.init",
      "caption": "Tap to open our App Store",
      "date": "2025-11-18",
      "tintColor": "#3a2a55",
      "imageURL": "https://i.ibb.co/3yhqBxqH/a53862b58d86.png",
      "notify": true,
      "url": "https://builds.io/explore",
      "appID": null
    }
  ]
}
tailwind.config = {
    darkMode: 'class',
}
let lastconsole = "";
const popupConsole = document.getElementById("console");
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    const line = document.createElement("div");
    lastconsole = args.join(" ");
    line.textContent = args.join(" ");
    popupConsole.appendChild(line);
    popupConsole.scrollTop = popupConsole.scrollHeight;
};
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
async function fetchScreenshotsForAppsNab(apps, progressCallback) { // nabzclan
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
    console.log(`✅ Ảnh lấy thành công: ${successCount} \n❌ Ảnh không lấy được: ${failureCount}`);
    // Đảm bảo tiến trình đạt 100% khi tất cả đã hoàn thành
    //progressCallback(100);
}
async function fetchScreenshotsForAppsThuthuatjb(apps, progressCallback) { // thuthuatjb
    let successCount = 0;
    let failureCount = 0;
    let processedCount = 0;
    const totalApps = apps.length;
    loadingTitle.textContent = `Đang tải ảnh chụp màn hình cho ${totalApps} ứng dụng...`;
    const tasks = apps.map(async (app) => {
        const bundleId = app.bundleIdentifier;
        const url = `https://ipa.thuthuatjb.com/view/lookimg.php?id=${bundleId}`;
        const nonsenUrl = ["https://ipa.thuthuatjb.com/view/img/repo-view.png", "https://ipa.thuthuatjb.com/view/img/repo-view-2.png", "https://ipa.thuthuatjb.com/view/img/repo-view-3.png"];
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Lỗi khi tải ${url}: ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Phản hồi không phải JSON từ ${url}`);
            }
            const json = await response.json();
            app.screenshotURLs = (json.screenshotUrls || []).filter(s => !nonsenUrl.includes(s));
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
    console.log(`✅ Ảnh lấy thành công: ${successCount} \n❌ Ảnh không lấy được: ${failureCount}`);
    // Đảm bảo tiến trình đạt 100% khi tất cả đã hoàn thành
    //progressCallback(100);
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
    popupConsole.innerHTML = "";
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
    console.log("Bắt đầu...")
    if (taskType === 'THUTHUATJB_TASK') {
        //mainThuthuatjb(updateProgressUI, data)
    } else if (taskType === 'NABZCLAN_TASK') {
       // mainNab(updateProgressUI, data)
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
    if (confirm(lastconsole)) {
        initiateDownload(source, fileName);
        progressCallback(100);
    } else {
        console.log("Đã hủy thao tác.");
    }
}
async function mainNab(updateProgressUI, source) { // lấy dữ liệu từ trang thuthuatjb
    if (!source.apps || !Array.isArray(source.apps)) {
        throw new Error("Dữ liệu không hợp lệ hoặc thiếu 'apps'");
    }
    console.log(`Bắt đầu lấy ảnh chụp màn hình cho ${source.apps.length} ứng dụng...`);
    await fetchScreenshotsForAppsNab(source.apps, updateProgressUI);
    const fileName = "repo.nabzclan.json";
    if (confirm(lastconsole)) {
        initiateDownload(source, fileName);
        progressCallback(100);
    } else {
        console.log("Đã hủy thao tác.");
    }
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
                localizedDescription: app.localizedDescription ?? "Lưu trữ IPA",
                versionDescription: app.versionDescription ?? "",
                tintColor: app.tintColor ?? "00adef",
                iconURL: app.iconURL ?? "./common/assets/img/generic_app.jpeg",
                screenshotURLs: app.screenshotURLs ?? [],
                screenshots: app.screenshots ?? [],
                appPermissions: app.appPermissions ?? {
                    "entitlements": [],
                    "privacy": {}
                },
                size: app.size ?? firstVersion.size ?? 0,
                version: app.version ?? firstVersion.version ?? "1.0.0",
                versions: app.versions ?? [versionInfo] ?? [],
                versionDate: appDate,
                downloadURL: app.downloadURL ?? firstVersion.downloadURL ?? "",
                patreon: app.patreon ?? {},
                download_page_url: app.download_page_url ?? ""
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
    newSource.META ||= {
        repoName: newSource.name,
        repoIcon: newSource.iconURL
    };
    newSource.sourceImage ||= newSource.iconURL;
    newSource.sourceURL ||= "https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/";
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
const repoConfigs = [{
    buttonId: 'button1',
    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.cypwn.json',
    url2: 'https://ipa.cypwn.xyz/cypwn.json',
    filename: 'repo.cypwn.json'
}, {
    buttonId: 'button2',
    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.cypwn_ts.json',
    url2: 'https://ipa.cypwn.xyz/cypwn_ts.json',
    filename: 'repo.cypwn_ts.json'
//}, {
//    buttonId: 'button3',
//    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.nabzclan.json',
//    url2: 'https://appstore.nabzclan.vip/repos/altstore.php',
//    filename: 'repo.nabzclan.json'
//}, {
//    buttonId: 'button4',
//    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.thuthuatjb.json',
//    url2: 'https://ipa.thuthuatjb.com/view/read.php',
//    filename: 'repo.thuthuatjb.json'
}, {
    buttonId: 'button7',
    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.buildstore.json',
    url2: '',
    filename: 'repo.buildstore.json'
}, {
    buttonId: 'button8',
    url1: 'https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.unkeyapp.json',
    url2: '',
    filename: 'repo.unkeyapp.json'
}];
repoConfigs.forEach(({
    buttonId,
    url1,
    url2,
    filename
}) => {
    document.getElementById(buttonId)?.addEventListener("click", async () => {
        if (buttonId == "button7") {
            loadingTitle.textContent = `Đang xử lý: BuildStore`;
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            overlay.classList.add('active'); // Hiện overlay
            popupConsole.innerHTML = "";
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
            console.log("Bắt đầu...")
            mainBuildStore(updateProgressUI);
        } else if (buttonId == "button8") {
            console.log("Bắt đầu...");
            loadingTitle.textContent = `Đang xử lý: Unkeyapp`;
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            overlay.classList.add('active'); // Hiện overlay
            popupConsole.innerHTML = "";
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
            const pageSize = 300;
            const total = 13000;
            let processedCount = 0;
            let successCount = 0;
            jsonData.apps = [];
            const totalPage = Math.ceil(total / pageSize);
            console.log("Bắt đầu lấy danh sách app...")
            console.log(`Dự kiến ${totalPage} lệnh get...`)
            for (let page = 1; page <= totalPage; page++) {
                try {
                    await fetchAndProcessApps(page, pageSize);
                    successCount++;
                } catch (e) {}
                processedCount++;
                const progressPercentage = Math.min(100, Math.round((processedCount / totalPage) * 100));
                updateProgressUI(progressPercentage)
                console.log(`📦 Đã xử lý ${processedCount}/${totalPage} lệnh get...`);
            }
            console.log(`✅ Lệnh thành công: ${successCount} \n ❌ Lệnh không lấy được: ${processedCount-successCount}`);
            console.log(`📦 Tổng số ${jsonData.apps.length} app \n OK để tải xuống.`);
            if (confirm(lastconsole)) {
                downloadJSON(jsonData, "repo.unkeyapp.json");
            } else {
                console.log("Đã hủy thao tác.");
            }
        } else compareAndDownloadJSON(url1, url2, filename);
    });
});
document.getElementById('button6')?.addEventListener("click", async () => {
    console.log("Bắt đầu...");
    loadingTitle.textContent = `Đang xử lý: Check All repo`;
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    overlay.classList.add('active'); // Hiện overlay
    popupConsole.innerHTML = "";
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
    let processedCount = 0;
    let successCount = 0;
    let tong = 5;
    const result = [];
    for (const {
            url1,
            url2,
            filename
        }
        of repoConfigs) {
        processedCount++;
        try {
            const re = await compareAndDownloadJSON(url1, url2, filename, false);
            re && result.push(re);
            successCount++;
        } catch (e) {}
        const progressPercentage = Math.min(100, Math.round((processedCount / tong) * 100));
        updateProgressUI(progressPercentage)
        console.log(`📦 Đã xử lý ${processedCount}/${tong} nguồn repo...`);
    }

    displayComparisonModalMultiResult(result);
});

function compareAppLists(oldData, newData) {
    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!oldData || !newData || !Array.isArray(oldData.apps) || !Array.isArray(newData.apps)) {
        console.error("Dữ liệu đầu vào không hợp lệ hoặc thiếu mảng 'apps'.");
        return {
            newAppsCount: 0,
            newAppsList: [],
            removedAppsCount: 0,
            removedAppsList: [],
            updatedAppsCount: 0,
            updatedAppsList: []
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

function downloadFile(data, filename) {
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

function initiateDownload(data, filename) {
  data.apps.forEach(obj => delete obj.download_page_url);
  const skipFiles = ["repo.cypwn.json", "repo.cypwn_ts.json", "repo.thuthuatjb.json"];
  if (!skipFiles.includes(filename)) {
    chrome.runtime.sendMessage({ type: "SAVE_CACHE", key: "bigData", value: data }, (res) => {
      console.log("Kết quả lưu:", res);
      if (confirm("Nhấn OK để tải file Json hoặc Hủy để chỉnh sửa trước tải!")) {
        downloadFile(data, filename);   // OK → tải file
      } else {
        window.open('https://drphe.github.io/KhoIPA/studio/', '_blank'); // Cancel → mở trang
      }
    });
  } else {
    downloadFile(data, filename);
  }
}

async function compareAndDownloadJSON(url1, url2, filename = 'new_version.json', isDisplay = true) {
    try {
        console.log("Bắt đầu fetch Json " + filename.split(".")[1]);
	if(filename =="repo.unkeyapp.json"){
    	    const [data_new, comparisonResult] = await getUpdateUnkeyapp();
            return {
                data: data_new,
                filename,
                comparisonResult
            };
	}
	if(filename =="repo.buildstore.json"){
    	    const [data_new, comparisonResult] = await getUpdateBuildStore();
            return {
                data: data_new,
                filename,
                comparisonResult
            };
	}

        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
        if (!res1.ok || !res2.ok) {
            throw new Error(`Lỗi HTTP: ${res1.status} hoặc ${res2.status}`);
        }
        const data1 = await res1.json();
        const data2 = await res2.json();
        data2.sourceURL = url1;
        const data_new = consolidateApps(data2);
        const comparisonResult = compareAppLists(data1, data_new);
        if (!isDisplay) {
            console.log(`${filename.split(".")[1]} OK`);
            return {
                data: data_new,
                filename,
                comparisonResult
            };
        } else displayComparisonModal(data_new, filename, comparisonResult);
    } catch (err) {
        console.log('Lỗi tải hoặc so sánh JSON:', err);
        alert('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra console.');
    }
}

function displayComparisonModalMultiResult(results) {
    let contentHTML = `<h2 class="text-xl">📦 Tổng quan cập nhật các Repo</h2><div style="  display: grid;
  grid-template-columns: 1fr 1fr;">`;
    results.forEach(({
        data,
        filename,
        comparisonResult
    }, index) => {
        const newAppsCount = comparisonResult?.newAppsCount || 0;
        const removedAppsCount = comparisonResult?.removedAppsCount || 0;
        const updatedAppsCount = comparisonResult?.updatedAppsCount ||0;
        contentHTML += `
      <div style="border: 1px solid #ccc; padding: 15px; margin: 15px 0; border-radius: 6px;">
        <h3 style="margin-bottom: 8px;">🔹 <b>${data?.name || filename}</b></h3>
        <ul style="list-style: none; padding-left: 0; font-size: 15px;">
          <li>📱 Tổng số ứng dụng: <b>${data?.apps.length||0}</b></li>
          <li>📦 Thống kê: <b style="color: green;">${newAppsCount}</b>/<b style="color: orange;">${updatedAppsCount}</b>/<b style="color: red;">${removedAppsCount}</b></li>
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
    overlay.classList.remove('active'); // Ẩn overlay
    popupConsole.innerHTML = "";
    loadingTitle.textContent = 'Đang Xử Lý...'; // Reset tiêu đề
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // Gán sự kiện cho từng nút tải xuống
    modal.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            const {
                data,
                filename
            } = results[index];
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
    const {
        newAppsCount,
        newAppsList,
        removedAppsCount,
        removedAppsList,
        updatedAppsCount,
        updatedAppsList
    } = result;
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
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1; display: flex; justify-content: center; align-items: center;';
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
    modalContent.innerHTML = contentHTML;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // Xử lý sự kiện nút
    document.getElementById('confirmDownload').onclick = () => {
        if (filename == "repo.nabzclan.json") runTask('Nabzclan', 'NABZCLAN_TASK', 0, dataToDownload);
        else if (filename == "repo.thuthuatjb.json") runTask('Thuthuatjb', 'THUTHUATJB_TASK', 0, dataToDownload);
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
///////////////
////////Upload image
////////////////////
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
            if (result.success) {
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
////////////////////
////unkey app store
//////////////////
function convertAppStructure(sourceApp) {
    const genreOrder = [["Games", 2],["Music", 3],["Utilities", 4]];
    const updatedAt = new Date(sourceApp.updatedAt);
    const versionDate = updatedAt.toISOString().split('T')[0]; // YYYY-MM-DD
    return {
        "beta": false,
        "name": sourceApp.name,
        "type": genreOrder.find(([g]) => sourceApp.genres.includes(g))?.[1] ?? 1, // Giá trị mặc định
        "bundleIdentifier": sourceApp.bundlerId, // Tương tự bundlerId
        "version": sourceApp.version,
        "size": sourceApp.fileSize || 0,
        "downloadURL": sourceApp.ipaLink, // Sử dụng ipaLink
        "iconURL": sourceApp.logo || "", // Sử dụng logo
        "versionDate": versionDate,
        "tintColor": "0cabeb",
        "screenshotURLs": sourceApp.screenshots || [],
        "localizedDescription": sourceApp.addDescription || "Lưu trữ IPA",
        "developerName": "Unkeyapp", // Mặc định là chuỗi rỗng
        "subtitle": sourceApp.addDescription || "",
    };
}
async function fetchAndProcessApps(page = 1, pageSize = 5) {
    const url = `https://api.unkeyapp.com/v1/application?page=${page}&pageSize=${pageSize}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const jsonResponse = await response.json();
        if (jsonResponse.code !== 200 || !jsonResponse.data || !Array.isArray(jsonResponse.data.data)) {
            console.error("Dữ liệu API không hợp lệ hoặc code không phải 200:", jsonResponse);
            return;
        }
        const appDataList = jsonResponse.data.data;
        const convertedApps = appDataList.map(app => {
            if (app.bundlerId && app.ipaLink) {
                return convertAppStructure(app);
            }
            return null;
        }).filter(app => app !== null);
        jsonData.apps.push(...convertedApps);
        console.log(`Đã lấy thành công ${jsonData.apps.length} ứng dụng.`);
    } catch (error) {
        console.error("Lỗi khi lấy hoặc xử lý dữ liệu ứng dụng:", error.message);
    }
}
///////////////
/////////Build Store
//////////////
async function mainBuildStore(progressCallback) {
    const apps = await getApplications();
    if (!apps) return;

    let allApp = apps.map(app => ({
        beta: false,
        name: (app.name || "unknown").replace("- iOSGods.com",""),
        type: getValue(app?.categories?.[0]?.slug),
        bundleIdentifier: `${app?.categories?.[0]?.slug || "app"}.${app.slug}`.replace(/_/g, '-'),
        developerName: "",
        subtitle: app.categories[0].description || "",
        localizedDescription: htmlToMarkdown(app.description || ""),
        versionDescription: "",
        tintColor: "3c2474",
        iconURL: app.icon || "",
        screenshotURLs: [],
        versions: [],
        URL: `https://builds.io/apps/${app?.categories?.[0]?.slug || "app"}/${app.slug || ""}`
    }));

    console.log("Lấy thông tin từng app...");
    let successCount = 0;
    let failureCount = 0;
    let processedCount = 0;
    await processAppsInBatches(allApp);
    console.log(`✅ App lấy thành công: ${successCount} \n ❌ App không lấy được: ${failureCount}`);
    jsonFile.apps = allApp.filter(app => app.versions && app.versions.length > 0 && app.downloadURL !== "");
    console.log(`Tổng số ${jsonFile.apps.length} apps.\n OK để tải xuống. `);
    if (confirm(lastconsole)) {
        downloadJSON(jsonFile, "repo.buildstore.json");
    } else {
        console.log("Đã hủy thao tác.");
    }
    async function processAppsInBatches(allApp) {
        const BATCH_SIZE = 300;
        const totalApps = allApp.length;
        for (let i = 0; i < totalApps; i += BATCH_SIZE) {
            const currentBatch = allApp.slice(i, i + BATCH_SIZE);
            await Promise.all(currentBatch.map(async (app) => {
                const results = await extractNextFData(app.URL);
                processedCount++;
                if (!results || results.length < 1) return;
                const target = results.find(r => typeof r.data === "string" && r.data.includes("appData"));
                if (!target) return;
                let obj;
                try {
                    obj = toJson(target.data);
                    successCount++;
                } catch (e) {
                    failureCount++;
                    console.warn("JSON parse lỗi cho app", app.name);
                    return;
                }
                const appData = obj.appData;
                if (!appData) return;
                app.developerName = appData?.developer?.name || "Unknown";
                app.screenshotURLs = appData.images || [];
                app.versions = transformArray(appData.versions || []);
                if (appData.blur_preview) app.beta = "xxx";
                if (appData.is_featured) jsonFile.featuredApps.push(app.bundleIdentifier);
                if (app.versions.length > 10) {
                    app.versions = app.versions.slice(0, 10);
                }
                const progressPercentage = Math.min(100, Math.round((processedCount / totalApps) * 100));
                progressCallback(progressPercentage);
                if (processedCount % 10 === 0 || processedCount === totalApps) {
                    console.log(`📦 Đã xử lý ${processedCount}/${totalApps} ứng dụng...`);
                }
            }));
        }
    }
}
    function getValue(key) {
        const map = {
            "games": 2,
            "ipa_builds": 4,
            "music-audio": 3,
            "emulators": 4
        };
        return map[key] || 1; // nếu không khớp thì trả về 1
    }
// ---------------------------------------------------------
// Lấy danh sách ứng dụng từ API
// ---------------------------------------------------------
async function getApplications() {
    console.log("Lấy danh sách App từ Builds.io...")
    const baseUrl = "https://ng-api.builds.io/api/v1/applications/?sort=updated_at&page=";
    const pageSize = 1000;
    try {
        // Lấy trang đầu tiên
        const res = await fetch(`${baseUrl}1&page_size=${pageSize}`);
        if (!res.ok) throw new Error(res.status);
        const json = await res.json();
        let apps = [...json.data];
        const total = json.count;
        // Nếu tổng > 1000 thì lấy thêm page 2
        if (total > 1000) {
            const res2 = await fetch(`${baseUrl}2&page_size=${pageSize}`);
            if (!res2.ok) throw new Error(res2.status);
            const json2 = await res2.json();
            apps = apps.concat(json2.data);
        }
        // Nếu tổng > 2000 thì lấy thêm page 3
        if (total > 2000) {
            const res3 = await fetch(`${baseUrl}3&page_size=${pageSize}`);
            if (!res3.ok) throw new Error(res3.status);
            const json3 = await res3.json();
            apps = apps.concat(json3.data);
        }
        console.log("Lấy danh sách thành công...")
        return apps;
    } catch (e) {
        console.error("API error", e);
        return null;
    }
}
// ---------------------------------------------------------
// Trích xuất self.__next_f.push từ HTML build.io
// ---------------------------------------------------------
async function extractNextFData(url) {
    const nextFData = [];
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0", // giả lập trình duyệt
            },
        });
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const scripts = [...doc.querySelectorAll("script")];
        // Regex linh hoạt hơn (không phụ thuộc \n)
        const pushRegex = /self\.__next_f\.push\(\[(\d+),\s*"([\s\S]*?)"\]\)/g;
        for (const s of scripts) {
            const code = s.textContent;
            if (!code.includes("self.__next_f.push")) continue;
            let match;
            while ((match = pushRegex.exec(code)) !== null) {
                const id = parseInt(match[1]);
                let raw = match[2];
                // Xử lý escape
                raw = raw.replace(/\\"/g, '"').replace(/\\n/g, '');
                nextFData.push({
                    id,
                    data: raw
                });
            }
        }
        return nextFData;
    } catch (err) {
        console.error("HTML parse error", err);
        return null;
    }
}

function toJson(raw) {
    // Bỏ escape rác thường thấy ở Next.js
    let cleaned = raw.replace(/\\\\\"/g, '\\"');
    const a = cleaned.indexOf('{"appData"');
    const b = cleaned.lastIndexOf('"success":true}') + '"success":true}'.length;
    if (a === -1 || b === -1) {
        throw new Error("Không tìm thấy đoạn JSON hợp lệ!");
    }
    cleaned = sanitizeJsonString(cleaned.substring(a, b) + "}");
    let start = cleaned.indexOf("{");
    if (start === -1) throw new Error("Không thấy dấu {");
    let stack = 0;
    for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === "{") stack++;
        else if (cleaned[i] === "}") stack--;
        if (stack === 0) {
            const jsonText = cleaned.slice(start, i + 1);
            return JSON.parse(jsonText);
        }
    }
    throw new Error("Không tìm được JSON hoàn chỉnh!");
}

function sanitizeJsonString(raw) {
    let cleaned = raw.replace(/\\(?!["\\/bfnrtu])/g, '');
    cleaned = cleaned.replace(/\\r/g, '\\r').replace(/\\n/g, '\\n').replace(/\\t/g, '\\t');
    return cleaned;
}
// ---------------------------------------------------------
// Chuyển đổi danh sách version
// ---------------------------------------------------------
function transformArray(arr, overrides = {}) {
    return arr.map(item => ({
        version: overrides.version || item.version || "unknown",
        date: overrides.date || item?.created_at?.split("T")[0] || "unknown",
        size: overrides.size || item.ipa_size || 0,
        downloadURL: overrides.downloadURL || item.ipa_url || "",
        localizedDescription: overrides.localizedDescription || htmlToMarkdown(item.changelog || "No description")
    }));
}


function downloadJSON(data, filename = "data.json") {
  overlay.classList.remove('active'); // Ẩn overlay
  popupConsole.innerHTML = "";
  loadingTitle.textContent = 'Đang Xử Lý...'; // Reset tiêu đề
  const consolidated = consolidateApps(data);
  chrome.runtime.sendMessage({ type: "SAVE_CACHE", key: "bigData", value: consolidated }, (res) => {
    console.log("Kết quả lưu:", res);
    if (confirm("Nhấn OK để tải file Json hoặc hủy để chỉnh sửa trước khi lưu.")) {
      downloadFile(consolidated, filename);
    } else {
      window.open('https://drphe.github.io/KhoIPA/studio/', '_blank');
    }
  });
}


function htmlToMarkdown(html) {
    return html
        // Heading h1-h6
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n').replace(/<h2>(.*?)<\/h2>/gi, '## $1\n').replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
	.replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n').replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n').replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n')
        // Bold & italic
        .replace(/<b>(.*?)<\/b>/gi, '**$1**').replace(/<strong>(.*?)<\/strong>/gi, '**$1**').replace(/<i>(.*?)<\/i>/gi, '*$1*')
	.replace(/<em>(.*?)<\/em>/gi, '*$1*')
        // Horizontal rule
        .replace(/<hr\s*\/?>/gi, '\n---\n')
        // Paragraphs -> xuống dòng
        .replace(/<p\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
        // Xóa thẻ dư thừa
        .replace(/<[^>]+>/g, '') // bỏ các thẻ HTML còn lại
        .replace(/\n{2,}/g, '\n') // gọn dòng trống
        .trim();
}
//getUpdateUnkeyapp()
async function getUpdateUnkeyapp() {
    console.log("Lấy dữ liệu mới nhất từ Unkeyapp")
    const results = await extractNextFData('https://www.unkeyapp.com/app-store/category?page=1');
    const filteredData = results.filter(item => item.data && item.data.includes("dataApp"));

    try {
        let Data = filteredData[0].data;
        //console.log(Data, extractDataApp(Data));
        const endA = JSON.parse(extractDataApp(Data));
        const appDataList = endA.dataApp.data;
        const convertedApps = appDataList.map(app => {
            if (app.bundlerId && app.ipaLink) {
                return convertAppStructure(app);
            }
            return null;
        }).filter(app => app !== null);
        //console.log(convertedApps);
        console.log("Lấy file cũ để update");
        const oldres = await fetch("https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.unkeyapp.json");
        const oldJson = await oldres.json();
        const sosanh = {
            newAppsCount: 0,
            newAppsList: [],
            removedAppsCount: 0,
            removedAppsList: [],
            updatedAppsCount: 0,
            updatedAppsList: []
        };
        convertedApps.forEach(app => {
            const data = oldJson.apps.find(j => j.bundleIdentifier == app.bundleIdentifier);
            if (data && data.versions) {
                const isver = data.versions.find(v => v.version == app.version);
                if (isver)
                    return;
                data.versions.push({
                    "version": app.version,
                    "date": app.versionDate,
                    "localizedDescription": app.localizedDescription,
                    "downloadURL": app.downloadURL,
                    "size": app.size
                })
                sosanh.updatedAppsList.push(app.bundleIdentifier);
                sosanh.updatedAppsCount++;
            } else {
                oldJson.apps.push(app);
                sosanh.newAppsList.push(app.bundleIdentifier);
                sosanh.newAppsCount++;
            }
        });
        console.log(`Có ${sosanh.updatedAppsCount} apps update, ${sosanh.newAppsCount} apps mới. \n Nhấn Ok để tải xuống.`);
        return [oldJson, sosanh];
    } catch (e) {
        console.log(e)
        return [null, null]
    }

    function extractDataApp(str) {
        const start = str.indexOf('{"dataApp"');
        if (start === -1)
            return null;
        let cut = str.slice(start);
        const endRegex = /\],\["\$\","\$[A-Za-z0-9]+",null,\{\}\]\]\}\]/;
        const match = cut.match(endRegex);
        if (match) {
            const end = cut.indexOf(match[0]);
            cut = cut.slice(0, end);
        }
        return cut.replace(/\.\\\\\",/g, '",').replace(/\\","/g, '","').replace(/\\"/g, '').replace(/\\\\\\/g, '').replace(/\\/g, '');
    }
}
//getUpdateBuildStore();
async function getUpdateBuildStore() {
    console.log("Lấy danh sách App mới nhất từ Builds.io...")
    const baseUrl = "https://ng-api.builds.io/api/v1/applications/?sort=updated_at&page=1&page_size=100";
    try {
        const res = await fetch(baseUrl);
        if (!res.ok) throw new Error(res.status);
        const json = await res.json();
        let apps = [...json.data];
        const total = json.count;
        let allApp = apps.map(app => ({
            beta: false,
            name: (app.name || "unknown").replace("- iOSGods.com",""),
            type: getValue(app?.categories?.[0]?.slug),
            bundleIdentifier: `${app?.categories?.[0]?.slug || "app"}.${app.slug}`.replace(/_/g, '-'),
            developerName: "",
            subtitle: app.categories[0].description || "",
            localizedDescription: htmlToMarkdown(app.description || ""),
            versionDescription: "",
            tintColor: "3c2474",
            iconURL: app.icon || "",
            screenshotURLs: [],
            versions: [],
            URL: `https://builds.io/apps/${app?.categories?.[0]?.slug || "app"}/${app.slug || ""}`
        }));
        await Promise.all(allApp.map(async (app) => {
            const results = await extractNextFData(app.URL);
            if (!results || results.length < 1) return;
            const target = results.find(r => typeof r.data === "string" && r.data.includes("appData"));
            if (!target) return;
            let obj;
            try {
                obj = toJson(target.data);
            } catch (e) {
                console.warn("JSON parse lỗi cho app", app.name);
                return;
            }
            const appData = obj.appData;
            if (!appData) return;
            app.developerName = appData?.developer?.name || "Unknown";
            app.screenshotURLs = appData.images || [];
            app.versions = transformArray(appData.versions || []);
			if(app.versions[0]?.downloadURL === "") console.log("Không lấy được link download!");
            if (appData.blur_preview) app.beta = "xxx";
            if (app.versions.length > 10) {
                app.versions = app.versions.slice(0, 10);
            }
        }));
        console.log("Kiểm tra UPDATE...");
        const oldres = await fetch("https://raw.githubusercontent.com/drphe/KhoIPA/main/upload/repo.buildstore.json");
        const oldJson = await oldres.json();
        const sosanh = {
            newAppsCount: 0,
            newAppsList: [],
            removedAppsCount: 0,
            removedAppsList: [],
            updatedAppsCount: 0,
            updatedAppsList: []
        };
	//console.log(allApp)
        allApp.forEach(app => {
            const data = oldJson.apps.find(j => j.bundleIdentifier === app.bundleIdentifier);
            if (data) {
                if (app.versions.length) {
                    let isupdate = 0;
                    app.versions.forEach(ver => {
                        // kiểm tra xem version này đã tồn tại trong data.versions chưa
                        const exists = data.versions.some(v => v.version === ver.version);
                        if (!exists) {
                            data.versions.push(ver); // thêm version mới
                            isupdate++;
                        }
                    });
                    if (isupdate) {
                        sosanh.updatedAppsList.push(app.bundleIdentifier);
                        sosanh.updatedAppsCount++;
                    }
                }
            } else {
                const data2 = oldJson.apps.find(j => j.bundleIdentifier.split(".")[1] === app.bundleIdentifier.split(".")[1]);
                if (data2) {
                    if (app.versions.length) {
                        data2.bundleIdentifier = app.bundleIdentifier;
                        let isupdate = 0;
                        app.versions.forEach(ver => {
                            // kiểm tra xem version này đã tồn tại trong data.versions chưa
                            const exists = data2.versions.some(v => v.version === ver.version);
                            if (!exists) {
                                data2.versions.push(ver); // thêm version mới
                                isupdate++;
                            }
                        });
                        if (isupdate) {
                            sosanh.updatedAppsList.push(app.bundleIdentifier);
                            sosanh.updatedAppsCount++;
                        }
                    }
                } else {
                    oldJson.apps.push(app);
                    sosanh.newAppsList.push(app.bundleIdentifier);
                    sosanh.newAppsCount++;
                }
            }
        });
	console.log("Lấy danh sách Featured Apps");
	const featuredApp = await getAndDisplayFormattedSlugs();
	if(featuredApp.length) {
		oldJson.featuredApps = featuredApp;
		console.log("Đã cập nhật danh sách ứng dụng Featured")
	}else {
		console.log("Không cập nhật danh sách Featured Apps");
	}
		console.log(sosanh)
        console.log(`Có ${sosanh.updatedAppsCount} apps update, ${sosanh.newAppsCount} apps mới. \n Nhấn Ok để tải xuống.`);
        return [oldJson, sosanh];
    } catch (e) {
        console.error("API error", e);
        return null;
    }
}
function getAppSlugsFormatted(exploreData) {
  const resultSlugs = [];
  const featured = exploreData?.data["featured_applications"];

  if (!Array.isArray(featured)) {
    console.error("Dữ liệu không hợp lệ: Không tìm thấy 'featured apps' là mảng.");
    return [];
  }

  featured.forEach(app => {
    const appSlug = app.slug;
    const categorySlug = app.categories[0].slug;

    if (categorySlug && appSlug) {
          const formattedSlug = `${categorySlug}.${appSlug}`;
          resultSlugs.push(formattedSlug);
    }
  });

  return resultSlugs;
}

async function getAndDisplayFormattedSlugs() {
  const apiUrl = 'https://ng-api.builds.io/api/v1/explore/';
  
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }

    const exploreData = await response.json(); 
    return getAppSlugsFormatted(exploreData);

  } catch (error) {
    console.error("Lỗi trong quá trình lấy hoặc xử lý dữ liệu:", error);
    return [];
  }
}



