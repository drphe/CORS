const svg = `<span aria-hidden="true" tabindex="-1" class="bp5-icon bp5-icon-credit-card"><svg data-icon="waterfall-chart" height="16" role="img" viewBox="0 0 16 16" width="16"><path d="M8 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 4h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1zm7-6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1zm4-3h-1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 10H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z" fill-rule="evenodd"></path></svg></span>`;

function handleRightClickOnRow(stockCode) {
    setTimeout(() => {
        const menu = document.querySelector('.bp5-menu');
        if (menu) {
            if (!menu.querySelector('.custom-analysis-item')) {
                const newItem = document.createElement('li');
                newItem.setAttribute('role', 'none');
                const span = document.createElement('span');
                span.className = "bp5-menu-item-icon";
                span.innerHTML = svg;

                const link = document.createElement('a');
                link.setAttribute('role', 'menuitem');
                link.setAttribute('tabindex', '0');
                link.className = 'bp5-menu-item bp5-popover-dismiss custom-analysis-item';

                const textDiv = document.createElement('div');
                textDiv.className = 'bp5-text-overflow-ellipsis bp5-fill';
                textDiv.textContent = `Mức chiết khấu`;
                link.appendChild(span);
                link.appendChild(textDiv);
                newItem.appendChild(link);
                // 🔼 Chèn vào đầu menu
                menu.insertBefore(newItem, menu.firstChild);
                // 🖱️ Gắn sự kiện click
                link.addEventListener('click', function(e) {
                    e.preventDefault(); // Ngăn hành vi mặc định nếu cần
                    runTechnicalAnalysis(stockCode); // Gọi hàm xử lý
                });

            }
        } else {
            console.warn('Menu chưa xuất hiện!');
        }
    }, 100); // Delay 100ms để chờ menu render
}

async function runTechnicalAnalysis(stockCode) {
    //alert(`📈 Đang phân tích kỹ thuật cho mã: ${stockCode}`);
    await fetchData(stockCode);

}

  document.addEventListener("dblclick", async (event) => {
    console.log(event.target)
    // Tìm phần tử tab được click (hoặc cha của phần tử được click)
    const tabButton = event.target.closest(".layout__tab_button");
    if (!tabButton) return;

    // Tìm phần tử chứa nội dung mã cổ phiếu
    const contentDiv = tabButton.querySelector(".layout__tab_button_content");
    if (!contentDiv) return;

    const tabText = contentDiv.textContent.trim();
    const stockCode = tabText.split("(")[0].trim();

    const isValidCode = stockCode === "VNINDEX" || /^[A-Z]{3}$/.test(stockCode);

    if (isValidCode) {
      await fetchData(stockCode);
    }
  }, true);


document.addEventListener('contextmenu', function(event) {
    const targetRow = event.target.closest('.bp5-context-menu');
    if (targetRow) {
        event.preventDefault();

        const stockLink = targetRow.querySelector('a[href*="/charts/content/symbols/"]');
        if (stockLink) {
            const stockCode = stockLink.textContent.trim();
            handleRightClickOnRow(stockCode);
        }
    }
});

var ckht = '';

async function fetchData(code) {
    code = code == "VNINDEX" ? "VN-INDEX" : code;
    const apiUrl = "https://mastrade.masvn.com/api/v1/tradingview/history?symbol=" + code + "&resolution=1D&from=1420070400&to=" + parseInt(Date.parse(getCurrentDate()) / 1000);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        var ohlc = [],
            closep = [];
        for (var i = 0; i < data.t.length; i += 1) {
            let k = 1000;
            ohlc.push({
                "time": parseInt(data.t[i]),
                "open": parseFloat(data.o[i]),
                "high": parseFloat(data.h[i]),
                "low": parseFloat(data.l[i]),
                "close": parseFloat(data.c[i])
            });
            closep.push({
                "time": data.t[i],
                "value": parseFloat(data.c[i])
            });
        }
        // tính toán drawdown
        var drawdown = findRecoveries(closep);

        var sampleData = [],
            sampleData2 = [];
        for (let i = 1; i < drawdown.length; i++) {
            sampleData.push(drawdown[i].drawdown)
            sampleData2.push(drawdown[i].recover)
        }
        const ci = calculateConfidenceInterval(sampleData);
        const ci2 = calculateConfidenceInterval(sampleData2);

        let table = renderResults(drawdown.slice(-30)); // bảng dữ liệu
        const mockResult = `Mức chiết khấu trung bình là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci.mean.toFixed(2)}%  [${ci.lowerBound.toFixed(2)}, ${ci.upperBound.toFixed(2)}]</span>. Mức hồi phục trung bình là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci2.mean.toFixed(2)}% [${ci2.lowerBound.toFixed(2)}, ${ci2.upperBound.toFixed(2)}]</span><br/> ${ckht}</div>${table}`;

        // tính phiên chạy nước rút
        const resultMe = checkLatestGrowth(closep);
        var iframeHtml = `<div class="bp5-callout bp5-intent-none">`;
        if (resultMe.length > 0) {
            iframeHtml += `<div class="bp5-callout bp5-intent-none"><h4  style="padding: 10px;margin: 4px;">📊 Chú ý phiên chạy nước rút</h4><ul style="text-align:left;">` + resultMe.map(msg => `<li>${msg}</li>`).join('') + `</ul></div>`;
        }
        console.log(resultMe)
        iframeHtml += `<h4  style="padding: 10px;margin: 4px;">📊 Các đợt điều chỉnh và mức chiết khấu</h4> ` + mockResult;
        showPopup(iframeHtml, code)
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function showPopup(dataHtml, code) {
    // Tạo thẻ div mới
    const portalDiv = document.createElement("div");
    portalDiv.className = "bp5-portal";

    portalDiv.innerHTML = `
<div aria-live="polite" class="bp5-overlay bp5-overlay-open bp5-overlay-scroll-container">
    <div class="bp5-overlay-backdrop bp5-overlay-appear-done bp5-overlay-enter-done"></div>
    <div class="bp5-dialog-container bp5-overlay-content bp5-overlay-appear-done bp5-overlay-enter-done" tabindex="0">
        <div class="bp5-dialog" role="dialog" aria-modal="true" aria-labelledby="title-bp-dialog-18" style="width: 890px; height: 600px;">
            <div class="bp5-dialog-header"><span aria-hidden="true" tabindex="-1" class="bp5-icon bp5-icon-application"><svg data-icon="application" height="16" role="img" viewBox="0 0 16 16" width="16">
                        <path d="M3.5 7h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-7c-.28 0-.5.22-.5.5s.22.5.5.5zM15 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm-1 12H2V5h12v8zM3.5 9h4c.28 0 .5-.22.5-.5S7.78 8 7.5 8h-4c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5z" fill-rule="evenodd"></path>
                    </svg></span>
                <h6 id="title-bp-dialog-18" class="bp5-heading">Phân tích mức chiết khấu - ${code}</h6><button type="button" aria-label="Close" class="bp5-button bp5-minimal bp5-dialog-close-button"><span aria-hidden="true" class="bp5-icon bp5-icon-small-cross"><svg data-icon="small-cross" height="16" role="img" viewBox="0 0 16 16" width="16">
                            <path d="M188.2 160L234 205.8C237.8 209.4 240 214.4 240 220C240 231 231 240 220 240C214.4 240 209.4 237.8 205.8 234.2L160 188.2L114.2 234.2C110.6 237.8 105.6 240 100 240C89 240 80 231 80 220C80 214.4 82.2 209.4 85.8 205.8L131.8 160L86 114.2C82.2 110.6 80 105.6 80 100C80 89 89 80 100 80C105.6 80 110.6 82.2 114.2 85.8L160 131.8L205.8 86C209.4 82.2 214.4 80 220 80C231 80 240 89 240 100C240 105.6 237.8 110.6 234.2 114.2L188.2 160z" fill-rule="evenodd" transform="scale(0.05, -0.05) translate(-160, -160)" style="transform-origin: center center;"></path>
                        </svg></span></button>
            </div>
            <div style="display:flex; flex: 1 1 0%; flex-direction: row;" class="sc-jsnFHz eMKivz bp5-dialog-body " >${dataHtml}</div>
        </div>
    </div>
</div>
`;
    const closeButtons = portalDiv.querySelector(".bp5-dialog-close-button");
    closeButtons.addEventListener("click", () => {
        portalDiv.remove();
    });
    // Chèn vào body hoặc vị trí mong muốn
    document.body.appendChild(portalDiv);
}



// kiểm tra phiên nước rút
function checkLatestGrowth(data) {
    const DAY = 86400;
    const latest = data[data.length - 1];
    const results = {
        week15: "📈 Giá tăng ít nhất 15% trong 1 tuần",
        twoWeek20: "🚀 Giá tăng hơn 20% trong 2 tuần",
        month30_50: "🌟 Giá tăng trong khoảng 30–50% trong 1 tháng"
    };
    let messages = {
        week15: results.week15 + " ❌",
        twoWeek20: results.twoWeek20 + " ❌",
        month30_50: results.month30_50 + " ❌"
    };

    let passed = false;

    for (let i = data.length - 2; i >= 0; i--) {
        const deltaDays = (latest.time - data[i].time) / DAY;
        const percent = ((latest.value - data[i].value) / data[i].value) * 100;

        if (deltaDays <= 7 && percent >= 15) {
            messages.week15 = `${results.week15} : <span style="padding: 2px; color: rgb(0, 170, 0);">+${percent.toFixed(2)}%</span>`;
            passed = true;
        }
        if (deltaDays <= 14 && percent > 20) {
            messages.twoWeek20 = `${results.twoWeek20} : <span style="padding: 2px; color: rgb(0, 170, 0);">+${percent.toFixed(2)}%</span>`;
            passed = true;
        }
        if (deltaDays <= 30 && percent >= 30) {
            messages.month30_50 = `${results.month30_50} :<span style="padding: 2px; color: rgb(0, 170, 0);"> +${percent.toFixed(2)}%</span>`;
            passed = true;
        }
    }

    return passed ? Object.values(messages) : [];
}

function calculateMA(data, period) {
    return data.map((_, index) => {
        if (index < period - 1) return null;
        const slice = data.slice(index - period + 1, index + 1);
        const average = slice.reduce((sum, val) => sum + val, 0) / period;
        return average;
    });
}

function formatTimestamp(timestamp) {
    // Chuyển đổi timestamp (giây) sang milliseconds
    const date = new Date(timestamp * 1000);

    // Lấy ngày, tháng và năm
    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = String(date.getFullYear()).slice(-2); // Lấy 2 chữ số cuối của năm

    // Trả về định dạng dd/mm/yy
    return `${day}/${month}/${year}`;
}

function findRecoveries(data) {
    const results = [];
    var ab = data.map(s => s.value);
    var ma10 = calculateMA(ab, 20); // tính MA10
    let peak = data[0].value; // Giá đỉnh ban đầu
    let tpeak = data[0].time; // Giá đỉnh ban đầu
    let trough = data[0].value; // Giá đáy ban đầu
    let ttrough = data[0].time; // Giá đáy ban đầu
    let inDecline = false; // Trạng thái đang sụt giảm, mặc định là không
    for (let i = 1; i < data.length; i++) {
        if (!inDecline) { // đang tăng
            if (data[i].value < peak) { // Bắt đầu sụt giảm
                inDecline = true;
                trough = data[i].value;
                ttrough = data[i].time;
            } else {
                peak = data[i].value; // Cập nhật đỉnh nếu vẫn tăng
                tpeak = data[i].time;
                inDecline = false;
            }
        } else { // đang giảm 
            if (trough > data[i].value) {
                trough = data[i].value; // Cập nhật đáy nếu vẫn giảm
                ttrough = data[i].time
                inDecline = true;
            } else {
                if (data[i].value > peak) {
                    peak = data[i].value; // Cập nhật đỉnh nếu giá hồi vượt đỉnh (không có đợt giảm sâu)
                    tpeak = data[i].time;
                    inDecline = false;
                } else {
                    // điều kiện xác nhận hồi phục khi đáy ở dưới ma20 và giá hồi phục vượt được ma20
                   if ((data[i].value > ma10[i] && trough < ma10[i]) || (data.length-i < 6)){ // giá vượt ngưỡng  phục hồi hoặc vượt MA20
                        const recoveryDate = data[i].time; // Thời điểm hồi phục
                        results.push({
                            drawdown: (1 - trough / peak) * 100,
                            start: peak,
                            startDate: formatTimestamp(tpeak),
                            bottom: trough,
                            bottomDate: formatTimestamp(ttrough),
                            recoveryDate: formatTimestamp(recoveryDate),
                            recoveryPrice: data[i].value,
                            recover: 0,
                        });
                        inDecline = false; // Xác nhận hồi phục
                        peak = data[i].value; // Reset đỉnh
                        tpeak = data[i].time; // Reset đỉnh
                    } else {
                        // chưa xác nhận đã hồi phục, tiếp tục giảm
                        inDecline = true;
                    }
                }
            }
        }
    }
    // lọc các đợt drawdown <2% do sideway nằm trong biên độ nhỏ
    const output = results.filter(item => item.drawdown > 2);
    // tính mức hồi phục bằng đỉnh mới- đáy cũ
    for (i = 0; i < output.length - 1; i++) {
        output[i].recover = 100 * output[i + 1].start / output[i].bottom - 100;
    }
    output[output.length - 1].recover = 100 * peak / output[output.length - 1].bottom - 100; // tính mức recover

    ckht = ''; //reset ckht;
    let temp = '';
    // kiểm tra giá trị mới nhất và đáy
    if (data[data.length - 1].value > trough) {
        temp = `Đã hồi phục từ ngày ${formatTimestamp(ttrough)}:<span style="padding: 2px; color: rgb(0, 170, 0);"> ${((data[data.length-1].value/trough-1)*100).toFixed(2)}%</span>. `;
    } else {
        temp = `Đã tăng từ đáy ${output[output.length-1].bottomDate}: <span style="padding: 2px; color: rgb(0, 170, 0);">${output[output.length-1].recover.toFixed(2)}%</span>.`;
    }

    if (data[data.length - 1].value * 1.02 < peak) {
        let gg = ((1 - data[data.length - 1].value / peak) * 100).toFixed(2);
        ckht += ` <span title="Đang hồi phục sau chiết khấu">HIỆN TẠI</span> đang chiết khấu từ đỉnh ${formatTimestamp(tpeak)}: <span style="padding: 2px; color: rgb(0, 170, 0);" >${gg}% </span>.${temp}<br/>${predict(output, gg)}`;
    } else {
        let gg = output[output.length - 1].drawdown.toFixed(2);
        temp = ` Đã tăng từ đáy ${results[results.length-1].bottomDate}: <span style="padding: 2px; color: rgb(0, 170, 0);">${results[results.length-1].recover.toFixed(2)}</span>%.`;
        ckht += `Mức chiết khấu của <span title="Đang xu hướng tăng hoặc đi ngang"> đỉnh gần nhất </span>${output[output.length-1].startDate}: <span style="padding: 2px; color: rgb(0, 170, 0);" >${gg}%</span>.${temp}<br/>${predict(output, gg)}`;
    }

    return output;
}

function calculateConfidenceInterval(data) {
    if (data.length === 0) return null; // Kiểm tra nếu mảng trống

    const n = data.length;
    const mean = data.reduce((sum, value) => sum + value, 0) / n;

    // Tính độ lệch chuẩn
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (n - 1);
    const standardDeviation = Math.sqrt(variance);

    // Sai số chuẩn
    const standardError = standardDeviation / Math.sqrt(n);

    // Giá trị Z cho mức tin cậy 95%
    const zScore = 1.96;

    // Khoảng tin cậy
    const marginOfError = zScore * standardError;
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return {
        mean,
        lowerBound,
        upperBound,
        standardDeviation,
        marginOfError,
        n
    };
}
// vẽ bảng
function renderResults(results) {
    results.reverse();
    let table = `<div class="bp5-callout bp5-intent-primary PinturaScrollableContent" style="height:530px;width:1320px"><h4 style="padding: 10px;margin: 4px;">📊 Bảng tổng hợp các đợt điều chỉnh/hồi phục</h4><table id="resultsTable" class="table-screens bp5-html-table bp5-html-table-striped bp5-interactive">
        <thead>
            <tr>
                <th style="text-align: right; white-space: nowrap;">Tạo đỉnh</th>
                <th style="text-align: right; white-space: nowrap;">Giá</th>
                <th style="text-align: right; white-space: nowrap;">Tạo đáy</th>
                <th style="text-align: right; white-space: nowrap;">Giá</th>
                <th style="text-align: right; white-space: nowrap;">Chiết khấu</th>
                <th style="text-align: right; white-space: nowrap;">Hồi phục</th>
            </tr>
        </thead>
        <tbody>`;

    results.forEach(result => {
        table += `<tr>
            <td style="text-align: right;">${result.startDate}</td>
            <td style="text-align: right;">${result.start.toFixed(2)}</td>
            <td style="text-align: right;">${result.bottomDate}</td>
            <td style="text-align: right;">${result.bottom.toFixed(2)}</td>
            <td style="text-align: right;">${result.drawdown.toFixed(2)} %</td>
            <td style="text-align: right;">${result.recover.toFixed(2)} %</td>
        </tr>`;
    });

    table += `</tbody></table></div>`;
    return table;

}

function getCurrentDate() {
    const t = new Date;
    return t.getFullYear() + "-" + String(t.getMonth() + 1)
        .padStart(2, "0") + "-" + String(t.getDate())
        .padStart(2, "0")
}


//Dự báo
function predict(data, dropValue) {
    // Tính toán hồi quy tuyến tính
    function calculateRegression(data) {
        const n = data.length;
        // Tính trung bình của x (drop) và y (recovery)
        const meanX = data.reduce((sum, point) => sum + point.drawdown, 0) / n;
        const meanY = data.reduce((sum, point) => sum + point.recover, 0) / n;

        // Tính Covariance và Variance
        let covariance = 0;
        let varianceX = 0;

        data.forEach(point => {
            covariance += (point.drawdown - meanX) * (point.recover - meanY);
            varianceX += Math.pow(point.drawdown - meanX, 2);
        });

        // Tính slope (a) và intercept (b)
        const slope = covariance / varianceX;
        const intercept = meanY - slope * meanX;

        return {
            slope,
            intercept
        };
    }

    // Dự báo mức hồi phục
    function predictRecovery(drop, model) {
        const {
            slope,
            intercept
        } = model;
        return slope * drop + intercept;
    }

    // Xây dựng mô hình hồi quy
    const model = calculateRegression(data);

    // Chuẩn bị dữ liệu cho biểu đồ
    const scatterData = data.map(point => ({
        x: point.drawdown,
        y: point.recover
    }));
    const regressionLine = [];
    for (let x = Math.min(...data.map(d => d.drawdown)) - 0; x <= Math.max(...data.map(d => d.drawdown)) + 5; x += 1) {
        regressionLine.push({
            x: x,
            y: predictRecovery(x, model)
        });
    }

    function findRecoveryLevel(recoveryArray) {
        recoveryArray = recoveryArray.filter(obj => obj.drawdown >= dropValue);
        recoveryArray.sort((a, b) => a.recover - b.recover);
        const index = Math.ceil(recoveryArray.length * 0.1);
        //console.log(recoveryArray, index)
        return recoveryArray[index];
    }
    let probabilitys = findRecoveryLevel(data).recover

    function calculateCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return numerator / denominator;
    }

    function linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return {
            slope,
            intercept
        };
    }

    function tTestCorrelation(r, n) {
        const t = r * Math.sqrt((n - 2) / (1 - r * r));
        return t;
    }

    function isSignificant(tValue, df, alpha = 0.05) {
        const criticalValue = 2.306;
        return Math.abs(tValue) > criticalValue ? 'có' : 'không';
    }
    // tương quan
    const dropLevels = data.map(d => d.drawdown);
    const recoveryLevels = data.map(d => d.recover);

    const correlation = calculateCorrelation(dropLevels, recoveryLevels);
    const regression = linearRegression(dropLevels, recoveryLevels);
    const tValue = tTestCorrelation(correlation, dropLevels.length);
    const df = dropLevels.length - 2;
    const significant = isSignificant(tValue, df);

    return `<i>Mức hồi phục dự báo là:<span style="padding: 2px; color: rgb(0, 170, 0);"> ${probabilitys.toFixed(2)}% </span>(xs 90%)</i><br/>------<br/>Hệ số tương quan: ${correlation.toFixed(2)}. Hệ số hồi quy: Slope = ${regression.slope.toFixed(2)}, Intercept = ${regression.intercept.toFixed(2)}. Giá trị t: ${tValue.toFixed(2)}, Mối tương quan ${significant} ý nghĩa thống kê.<br/>`;
}