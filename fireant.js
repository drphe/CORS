// ==  khai báo biến
const svg = `<span aria-hidden="true" tabindex="-1" class="bp5-icon bp5-icon-credit-card"><svg data-icon="waterfall-chart" height="16" role="img" viewBox="0 0 16 16" width="16"><path d="M8 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 4h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1zm7-6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1zm4-3h-1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 10H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z" fill-rule="evenodd"></path></svg></span>`;
var ckht = ''; // cho phân tích sụt giảm
let currentObserver = null; // Biến toàn cục để giữ observer hiện tại
let oldcode = null;
let THEME = null;
// ==========Chức năng định giá
// Thêm menu chuột phải
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
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

function handleRightClickOnRow(stockCode) {
    if (stockCode !== "VNINDEX" && stockCode.length !== 3) return;
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
                textDiv.textContent = `Định giá`;
                link.appendChild(span);
                link.appendChild(textDiv);
                newItem.appendChild(link);
                menu.insertBefore(newItem, menu.firstChild);
                link.addEventListener('click', debounce((e) =>{
                    e.preventDefault(); // Ngăn hành vi mặc định nếu cần
                    runTechnicalAnalysis(stockCode); // Gọi hàm xử lý
                }, 300));
            }
        }
        else {
            console.log('Menu chưa xuất hiện!');
        }
    }, 100); // Delay 100ms để chờ menu render
}
async function runTechnicalAnalysis(stockCode) {
    let url = stockCode == "VNINDEX" ? "valuation.html" : "dinhgia.html"
    var iframeCode = `<iframe src="${chrome.runtime.getURL(url)}?code=${stockCode}&theme=${THEME}" style="border:none; width:100%; height:100%"/>`;
    showPopup(iframeCode, stockCode, "Phân tích định giá");
}

// Thêm định giá, chiết khấu trong thông tin cổ phiếu
// kiểm tra tên mã cổ phiếu
let codeCP = null;
let isPop = false; // nếu tạo rồi thì thôi
function addDinhgia() {
    const headerElement = document.querySelector(".bp5-dialog-header");
    if (headerElement) {
        const text = headerElement.textContent.trim();
        if (text.length == 3 || text == "VNINDEX") {
            codeCP = text;
        }
        else {
            codeCP = null;
        }
        if (isPop) return;
        // thêm nút định giá
        const dialogBody = document.querySelector("div.bp5-dialog-body");
        if (dialogBody && codeCP) {
            const ulElement = dialogBody.querySelector("ul");
            const elements = dialogBody.querySelectorAll("div span.bp5-popover-target");
            if (ulElement) {
                const liElements = ulElement.querySelectorAll("li");
                if (liElements.length >= 2) {
                    const secondLi = liElements[1];
                    const clonedLi = secondLi.cloneNode(true);
                    clonedLi.textContent = "Định giá";
                    clonedLi.addEventListener("click", debounce(() =>{
                        runTechnicalAnalysis(codeCP); // gọi hàm bạn muốn
                    }, 300));

                    ulElement.insertBefore(clonedLi, liElements[0].nextSibling);
                    isPop = true;
                }
            }
            if (elements.length > 0) {
                const lastDiv = elements[elements.length - 1];
                const clonedSpan = lastDiv.cloneNode(true);
                const button = clonedSpan.querySelector("button");
		button.style.marginRight = "4px";
                button.innerHTML = `<span aria-hidden="true" class="bp5-icon bp5-icon-cog"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" width="24" height="22" fill="none"><g class="normal-eye"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M17.9948 7.91366C16.6965 6.48549 14.6975 5 11.9999 5C9.30225 5 7.30322 6.48549 6.00488 7.91366C6.00488 7.91366 4 10 4 11C4 12 6.00488 14.0863 6.00488 14.0863C7.30322 15.5145 9.30225 17 11.9999 17C14.6975 17 16.6965 15.5145 17.9948 14.0863C17.9948 14.0863 20 12 20 11C20 10 17.9948 7.91366 17.9948 7.91366ZM6.74482 13.4137C7.94648 14.7355 9.69746 16 11.9999 16C14.3022 16 16.0532 14.7355 17.2549 13.4137C17.2549 13.4137 19 11.5 19 11C19 10.5 17.2549 8.58634 17.2549 8.58634C16.0532 7.26451 14.3022 6 11.9999 6C9.69746 6 7.94648 7.26451 6.74482 8.58634C6.74482 8.58634 5 10.5 5 11C5 11.5 6.74482 13.4137 6.74482 13.4137Z"></path><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z"></path></g><g class="loading-eye"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M17.9948 7.91366C16.6965 6.48549 14.6975 5 11.9999 5C9.30225 5 7.30322 6.48549 6.00488 7.91366C6.00488 7.91366 4 10 4 11C4 12 6.00488 14.0863 6.00488 14.0863C7.30322 15.5145 9.30225 17 11.9999 17C14.6975 17 16.6965 15.5145 17.9948 14.0863C17.9948 14.0863 20 12 20 11C20 10 17.9948 7.91366 17.9948 7.91366ZM6.74482 13.4137C7.94648 14.7355 9.69746 16 11.9999 16C14.3022 16 16.0532 14.7355 17.2549 13.4137C17.2549 13.4137 19 11.5 19 11C19 10.5 17.2549 8.58634 17.2549 8.58634C16.0532 7.26451 14.3022 6 11.9999 6C9.69746 6 7.94648 7.26451 6.74482 8.58634C6.74482 8.58634 5 10.5 5 11C5 11.5 6.74482 13.4137 6.74482 13.4137Z"></path></g><g class="animated-loading-eye"><path stroke="currentColor" stroke-linecap="round" d="M14.5 11C14.5 9.61929 13.3807 8.5 12 8.5C10.6193 8.5 9.5 9.61929 9.5 11C9.5 12.3807 10.6193 13.5 12 13.5"></path></g></svg></span>`;
                clonedSpan.addEventListener("click", debounce((e) =>{
                    e.preventDefault();
                    fetchData(codeCP); // gọi hàm bạn muốn
                }, 300));
                // chèn sau phần tử cuối cùng
                lastDiv.parentElement.insertBefore(clonedSpan, lastDiv.parentElement.firstChild);
            }
        }
    }
    else {
        codeCP = null;
        isPop = false
        return;
    }
}


// ===  chức năng phân tích sụt giảm
async function fetchData(code) {
    console.clear();
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
        let table = renderResults(drawdown.slice(-10)); // bảng dữ liệu
        const mockResult = `Mức chiết khấu TB (n = ${ci.n}) là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci.mean.toFixed(2)}%  [${ci.lowerBound.toFixed(2)}, ${ci.upperBound.toFixed(2)}]</span>. Mức hồi phục TB (n = ${ci2.n}) là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci2.mean.toFixed(2)}% [${ci2.lowerBound.toFixed(2)}, ${ci2.upperBound.toFixed(2)}]</span><br/> ${ckht}</div>${table}`;
        // tính phiên chạy nước rút
        const resultMe = checkLatestGrowth(closep);
        var iframeHtml = `<div class="bp5-callout bp5-intent-none" style="width: 640px !important;">`;
        iframeHtml += `<h4  style="padding: 10px;margin: 4px;">📊 Các đợt điều chỉnh và mức chiết khấu</h4> ` + mockResult;
        const temp = drawdown.slice(-11);
        let arrayData = [];
        for (var i = 1; i < temp.length; i++) {
            arrayData.push({
                date: temp[i].startDate,
                price: temp[i].start,
                change: "▲" + temp[i - 1].recover.toFixed(2) + "%"
            });
            arrayData.push({
                date: temp[i].bottomDate,
                price: temp[i].bottom,
                change: "▼" + temp[i].drawdown.toFixed(2) + "%"
            });
        }
        let endValue = closep[closep.length - 1].value; // cuối cùng
        let endArrayValue = arrayData[arrayData.length - 1].price;
        let iconChange = endValue > endArrayValue ? "▲" : "▼";
        let percentCh = (endValue / endArrayValue - 1) * 100;
        arrayData.push({
            date: formatTimestamp(closep[closep.length - 1].time),
            price: endValue,
            change: iconChange + percentCh.toFixed(2) + "%"
        });
        if (resultMe.length > 0) {
            showCopiedAlert("", 1, `<span style="font-weight: bolder;">📊 Chú ý phiên chạy nước rút</span><ul style="text-align:left;padding:0px;">` + resultMe.map(msg => `<li>${msg}</li>`).join('') + `</ul>`, () => {
                const portDiv = showPopup(iframeHtml, code); renderChart(arrayData,portDiv);
            });
        }
        else {
            const portDiv = showPopup(iframeHtml, code);
	    renderChart(arrayData,portDiv);

        }
        console.log(arrayData)
    }
    catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        showCopiedAlert("", 1, "Đã có lỗi không tải được dữ liệu, kiểm tra và thử lại!")
    }
}
// vẽ biểu đồ
function renderChart(data, portDiv) {
    // Nếu chưa có container thì tạo mới
        container = document.createElement('div');
        container.id = 'container';
        container.style.width = '100%';
        container.style.height = '250px';
        const div = portDiv.querySelector('div.bp5-callout.bp5-intent-none');
        div?.appendChild(container);
    // Lấy categories và data
    const categories = data.map(d => d.date);
    const priceData = data.map(d => d.price);
    // ===== Linear Regression =====
    function linearRegression(data) {
        const n = data.length;
        let sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumXX = 0;
        data.forEach((y, x) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return {
            slope,
            intercept
        };
    }
    const {
        slope,
        intercept
    } = linearRegression(priceData);
    // Tạo trendline
    const trendlineData = priceData.map((_, i) => slope * i + intercept);
    Highcharts.chart('container', {
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            events: {
                load: function() {
                    const chart = this;
                    chart.container.addEventListener('mousemove', function(e) {
                        const point = chart.series[0].searchPoint(e, true);
                        const rect = chart.container.getBoundingClientRect();
                        const chartY = e.clientY - rect.top;
                        const yValue = chart.yAxis[0].toValue(chartY);
                        chart.yAxis[0].removePlotLine('hover-line');
                        // Thêm plotLine nét đứt tại vị trí con trỏ
                        chart.yAxis[0].addPlotLine({
                            value: yValue,
                            color: 'grey',
                            width: 1,
                            dashStyle: 'Dash',
                            id: 'hover-line',
                            zIndex: 5
                        });
                        if (point) {
                            const x = point.x;
                            // Xóa plotBand và plotLine cũ
                            chart.xAxis[0].removePlotBand('hover-band');
                            // Thêm plotBand highlight vùng
                            chart.xAxis[0].addPlotBand({
                                from: x - 0.5,
                                to: x + 0.5,
                                color: 'rgba(100,100,255,0.15)',
                                id: 'hover-band'
                            });
                        }
                    });
                    chart.container.addEventListener('mouseleave', function() {
                        chart.xAxis[0].removePlotBand('hover-band');
                        chart.yAxis[0].removePlotLine('hover-line');
                    });
                }
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            visible: false,
            categories: categories,
            title: {
                text: '',
                color: '#ffffff'
            }
        },
        yAxis: {
            title: {
                text: '',
                style: {
                    color: 'grey'
                }
            },
            labels: {
                style: {
                    color: 'grey'
                }
            },
            gridLineColor:  THEME =="dark"?'#444444':'#efefef',
            gridLineWidth: 1
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            followPointer: false, // ko cho theo chuột
            outside: false,
            positioner: function(labelWidth, labelHeight) {
                const chart = this.chart;
                return {
                    x: chart.plotLeft + chart.plotWidth - labelWidth,
                    y: chart.plotTop + chart.plotHeight - labelHeight
                };
            },
            backgroundColor: THEME =="dark"?'#333333':'#fff',
            style: {
                color: THEME=='dark'?'#ffffff':'#1c2127'
            },
            formatter: function() {
                const d = data[this.point.index];
                return `<b>${d.date}</b><br/>Giá: ${d.price.toFixed(2)}<br/>${d.change}`;
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Trendline',
            data: trendlineData,
            dashStyle: 'Dash',
            marker: {
                enabled: false,
                radius: 1
            }
        }, {
            name: 'Giá',
            data: data.map(d => ({
                y: d.price,
                dataLabels: {
                    enabled: true,
                    color: d.change.includes("▲") ? 'green' : 'red',
                    format: d.change
                }
            })),
            color: 'deepskyblue',
            lineWidth: 2,
            marker: {
                enabled: false, // Ẩn chấm mặc định
                radius: 1, // Kích thước nhỏ
                states: {
                    hover: {
                        enabled: true, // Chỉ hiện khi hover
                        fillColor: '#ffffff',
                        lineColor: 'deepskyblue',
                        lineWidth: 2
                    }
                }
            }
        }]
    });
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
// tính toán drawdown
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
            }
            else {
                peak = data[i].value; // Cập nhật đỉnh nếu vẫn tăng
                tpeak = data[i].time;
                inDecline = false;
            }
        }
        else { // đang giảm 
            if (trough > data[i].value) {
                trough = data[i].value; // Cập nhật đáy nếu vẫn giảm
                ttrough = data[i].time
                inDecline = true;
            }
            else {
                if (data[i].value > peak) {
                    peak = data[i].value; // Cập nhật đỉnh nếu giá hồi vượt đỉnh (không có đợt giảm sâu)
                    tpeak = data[i].time;
                    inDecline = false;
                }
                else {
                    // điều kiện xác nhận hồi phục khi đáy ở dưới ma20 và giá hồi phục vượt được ma20
                    if ((data[i].value > ma10[i] && trough < ma10[i]) || (data.length - i < 6)) { // giá vượt ngưỡng  phục hồi hoặc vượt MA20
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
                    }
                    else {
                        // chưa xác nhận đã hồi phục, tiếp tục giảm
                        inDecline = true;
                    }
                }
            }
        }
    }
    // lọc các đợt drawdown <3% do sideway nằm trong biên độ nhỏ
    const output = results.filter(item => item.drawdown > 3);
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
    }
    else {
        temp = `Hồi phục từ đáy ${output[output.length-1].bottomDate}: <span style="padding: 2px; color: rgb(0, 170, 0);">${output[output.length-1].recover.toFixed(2)}%</span>.`;
    }
    if (data[data.length - 1].value * 1.02 < peak) {
        let gg = ((1 - data[data.length - 1].value / peak) * 100).toFixed(2);
        ckht += ` <span title="Đang hồi phục sau chiết khấu">HIỆN TẠI</span> đang chiết khấu từ đỉnh ${formatTimestamp(tpeak)}: <span style="padding: 2px; color: rgb(0, 170, 0);" >${gg}% </span>.${temp}<br/>${predict(output, gg)}`;
    }
    else {
        let gg = output[output.length - 1].drawdown.toFixed(2);
        temp = ` Hồi phục từ đáy ${results[results.length-1].bottomDate}: <span style="padding: 2px; color: rgb(0, 170, 0);">${results[results.length-1].recover.toFixed(2)}</span>%.`;
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
// vẽ bảng drawdown
function renderResults(results) {
    results.reverse();
    let table = `<div class="bp5-callout bp5-intent-primary PinturaScrollableContent" style="height: 530px;"><table id="resultsTable" class="table-screens bp5-html-table bp5-html-table-striped bp5-interactive" style="width: 100%;table-layout: fixed; border-collapse: collapse;">
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
            <td style="text-align: right;">${result.start.toFixed(0)}</td>
            <td style="text-align: right;">${result.bottomDate}</td>
            <td style="text-align: right;">${result.bottom.toFixed(0)}</td>
            <td style="text-align: right;">${result.drawdown.toFixed(2)} %</td>
            <td style="text-align: right;">${result.recover.toFixed(2)} %</td>
        </tr>`;
    });
    table += `</tbody></table></div>`;
    return table;
}

function getCurrentDate() {
    const t = new Date;
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0")
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
//===== copy link báo cáo khi click chuột phải==========================//
document.addEventListener("contextmenu", function(event) {
    const link = event.target.closest('a[href^="/charts/content/reports/"], a[href^="/analysis/content/reports/"], a[href^="/dashboard/content/reports/"]');
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute("href");
    if (!href) return;
    const id = href.split("/").pop();
    const url = `https://static.fireant.vn/reports/content/${id}`;
    showCopiedAlert(url);
    console.log(id);
    copyText(url);
});
async function copyText(text) {
    await navigator.clipboard.writeText(text);
    // alert('Đã copy vào clipboard!');
}

function extractReportId() {
    const url = window.location.href;
    const match = url.match(/\/reports\/(\d+)$/);
    return match ? match[1] : null;
}

function getBC() {
    const reportId = extractReportId();
    const url = `https://static.fireant.vn/reports/content/` + reportId
    console.log(reportId);
    copyText(url)
}
// ============ hiển thị thông báo ================//
// hiển thị kết quả - định giá/drawdown
function showPopup(dataHtml, code, title = "Phân tích mức chiết khấu") {
    // Tạo thẻ div mới
    const portalDiv = document.createElement("div");
    portalDiv.className = "bp5-portal";
    portalDiv.innerHTML = `
<div aria-live="polite" class="bp5-overlay bp5-overlay-open bp5-overlay-scroll-container">
    <div class="bp5-overlay-backdrop bp5-overlay-appear-open bp5-overlay-enter-open"></div>
    <div class="bp5-dialog-container bp5-overlay-content bp5-overlay-appear-open bp5-overlay-enter-done" tabindex="0">
        <div class="bp5-dialog" role="dialog" aria-modal="true" aria-labelledby="title-bp-dialog-18" style="width: 890px; height: 600px;">
            <div class="bp5-dialog-header"><span aria-hidden="true" tabindex="-1" class="bp5-icon bp5-icon-application"><svg data-icon="application" height="16" role="img" viewBox="0 0 16 16" width="16">
                        <path d="M3.5 7h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-7c-.28 0-.5.22-.5.5s.22.5.5.5zM15 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm-1 12H2V5h12v8zM3.5 9h4c.28 0 .5-.22.5-.5S7.78 8 7.5 8h-4c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5z" fill-rule="evenodd"></path>
                    </svg></span>
                <h6 id="title-bp-dialog-18" class="bp5-heading">${title} - ${code}</h6><button type="button" aria-label="Close" class="bp5-button bp5-minimal bp5-dialog-close-button"><span aria-hidden="true" class="bp5-icon bp5-icon-small-cross"><svg data-icon="small-cross" height="16" role="img" viewBox="0 0 16 16" width="16">
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
    const backdrop = portalDiv.querySelector(".bp5-overlay-backdrop");
    backdrop.addEventListener("click", () => {
        portalDiv.remove();
    });
    // Chèn vào body hoặc vị trí mong muốn
    document.body.appendChild(portalDiv);
    return portalDiv;
}
// hiển thị thông báo
function showCopiedAlert(url, isAlert = false, title = "", func = null) {
    const chuong = `<img alt="" src="https://static.fireant.vn/web/images/icons/widgets/notification.svg" width="40" height="40" style="font-size:14px;">`;
    const baocao = `<img alt="" src="https://static.fireant.vn/web/images/icons/widgets/report.svg" width="40" height="40" style="font-size:14px;">`;
    const dltext = func ? "Tiếp tục" : "Tải xuống"
    const alertHtml = `
    <div class="bp5-portal" id="custom-report-alert">
      <div aria-live="polite" class="bp5-overlay bp5-overlay-open bp5-overlay-scroll-container">
        <div tabindex="0" class="bp5-overlay-start-focus-trap bp5-overlay-enter-done"></div>
        <div class="bp5-overlay-backdrop bp5-overlay-enter-done"></div>
        <div class="bp5-dialog-container bp5-overlay-content bp5-overlay-enter-done" tabindex="0">
          <div class="bp5-dialog bp5-alert" role="alertdialog" aria-modal="true">
            <div class="bp5-alert-body">
	      <span aria-hidden="true" class="bp5-icon bp5-icon-mugshot bp5-intent-primary">${isAlert?chuong:baocao}</span>
              <div class="bp5-alert-contents">
                <p>${isAlert?title:"Đã sao chép đường dẫn báo cáo, sử dụng Ctrl+V để dán đường dẫn."}</p>
              </div>
            </div>
            <div class="bp5-alert-footer">
	      ${isAlert && !func?"":`<button type="button" class="bp5-button bp5-button bp5-intent-primary" id="alert-download-btn">
                <span class="bp5-button-text">${dltext}</span>
              </button>`}
	      <button type="button" class="bp5-button" id="alert-dismiss-btn">
                <span class="bp5-button-text">Bỏ qua</span>
              </button>
            </div>
          </div>
        </div>
        <div tabindex="0" class="bp5-overlay-end-focus-trap bp5-overlay-enter-done"></div>
      </div>
    </div>
  `;
    // Chèn vào body
    document.body.insertAdjacentHTML("beforeend", alertHtml);
    const alertBox = document.getElementById("custom-report-alert");
    const dismissBtn = document.getElementById("alert-dismiss-btn");
    const dlBtn = document.getElementById("alert-download-btn");
    const backdrop = alertBox.querySelector(".bp5-overlay-backdrop");
    // Hàm đóng alert
    function closeAlert() {
        if (alertBox) {
            alertBox.remove();
            document.removeEventListener("keydown", escHandler);
        }
    }
    // ESC để đóng
    function escHandler(e) {
        if (e.key === "Escape") {
            closeAlert();
        }
    }
    document.addEventListener("keydown", escHandler);
    // Nút "Bỏ qua"
    if (dismissBtn) {
        dismissBtn.addEventListener("click", closeAlert);
    }
    if (dlBtn) {
        dlBtn.addEventListener("click", () => {
            if (func) func();
            else window.open(url, "_blank");
            closeAlert()
        });
    }
    // Click ra ngoài (backdrop)
    if (backdrop) {
        backdrop.addEventListener("click", closeAlert);
    }
}
// ============ Chức năng tổng hợp Auto================//
setInterval(() => {
    // Load dữ liệu tin tức và nút nâng cao
    loadDataForCode();
    //  chèn nút định giá, chiết khấu vào bảng thông tin
    addDinhgia();
    // chèn nút tải báo cáo
    setTimeout(() => {
        const dialogBody = document.querySelector('.bp5-dialog-body');
        if (!dialogBody) return;
        const downloadButtons = dialogBody.querySelectorAll('button.bp5-button');
        const hasDownloadButton = Array.from(downloadButtons).some(btn => btn.textContent.trim() === 'Tải về');
        const alreadyInserted = dialogBody.querySelector('button.bp5-button[data-custom="NoteBookLM"]');
        if (hasDownloadButton && !alreadyInserted) {
            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.className = 'bp5-button';
            newButton.setAttribute('data-custom', 'NoteBookLM');
            newButton.style.marginLeft = '10px';
            newButton.addEventListener('click', debounce(() => {
                getBC();
                newButton.classList.add("bp5-intent-primary");
            }, 300));
            const iconSpan = document.createElement('span');
            iconSpan.className = 'bp5-icon bp5-icon-download';
            iconSpan.setAttribute('aria-hidden', 'true');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('height', '16');
            svg.setAttribute('width', '16');
            svg.setAttribute('role', 'img');
            svg.setAttribute('viewBox', '0 0 200 200');
            const g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g1.setAttribute('id', 'Layer_1');
            const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M87.27,1.14C39.07,1.14,0,39.88,0,87.69v41.44h16.09v-4.13c0-19.39,15.84-35.11,35.39-35.11s35.39,15.72,35.39,35.11v4.13h16.09v-4.13c0-28.2-23.05-51.05-51.48-51.05-11.07,0-21.32,3.46-29.72,9.37,8.79-17.32,26.88-29.21,47.77-29.21,29.51,0,53.44,23.74,53.44,53v22.02h16.09v-22.02c0-38.08-31.13-68.96-69.53-68.96-17.27,0-33.06,6.24-45.22,16.58,11.94-22.39,35.65-37.64,62.97-37.64,39.32,0,71.19,31.61,71.19,70.6v41.44h16.09v-41.44C174.55,39.88,135.48,1.14,87.27,1.14Z');
            g2.appendChild(path);
            g1.appendChild(g2);
            svg.appendChild(g1);
            iconSpan.appendChild(svg);
            const textSpan = document.createElement('span');
            textSpan.className = 'bp5-button-text';
            textSpan.textContent = 'Sao chép Link';
            newButton.appendChild(iconSpan);
            newButton.appendChild(textSpan);
            const targetButton = Array.from(downloadButtons).find(btn => btn.textContent.trim() === 'Tải về');
            if (targetButton) {
                targetButton.parentNode.insertBefore(newButton, targetButton.nextSibling);
            }
        }
    }, 500); // Chờ 300ms trước khi kiểm tra và chèn nút
    // thế giá lên
    const iframe = document.querySelector('[id^="chart_"] iframe');
    if (!iframe) return;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const a = [...iframeDoc.querySelectorAll('input')].map(el => el.getAttribute('data-property-id'));
    if (a.length == 9) { // giới hạn 9input không nhiều hơn
        calcTheGiaLen(iframeDoc);
    }
    // theme dark/light
    const checkbox = document.querySelector('.switch-theme-button input[type="checkbox"]');
    if (!THEME && checkbox) {
        THEME = checkbox.checked ? "dark" : "light";
        checkbox.addEventListener("change", function() {
            THEME = checkbox.checked ? "dark" : "light";
        });
    }
}, 1000);
//===========  công cụ Thế giá lên ===============//
function calcTheGiaLen(iframeDoc) {
    // lấy giá và stoploss
    let price = 0;
    let stoploss = iframeDoc.querySelectorAll(`input[data-property-id="Risk/RewardlongStopLevelTicks"]`)[0].value;
    let total = iframeDoc.querySelectorAll(`input[data-property-id="Risk/RewardlongAccountSize"]`)[0].value;

    function duplicateInputWrapper(propertyId) {
        const input = iframeDoc.querySelectorAll(`input[data-property-id="${propertyId}"]`)[0];
        if (!input || input.length > 1) return;
        const wrapper = input.parentElement?.parentElement;
        if (!wrapper) return;
        const clone = wrapper.cloneNode(true);
        clone.style.marginLeft = "0.5rem";
        clone.setAttribute("readonly", true);
        wrapper.insertAdjacentElement("afterend", clone);
    }
    // nhân đôi thẻ lot và account
    duplicateInputWrapper("Risk/RewardlongAccountSize"); // => tổng tiền
    duplicateInputWrapper("Risk/RewardlongLotSize"); // => tổng lỗ
    // nhân đôi và lắng nghe
    function duplicateInputWrapper(propertyId, onChangeHandler) {
        const input = iframeDoc.querySelector(`input[data-property-id="${propertyId}"]`);
        if (!input || input.length > 1) return;
        price = input.value;
        const wrapper = input.parentElement?.parentElement;
        if (!wrapper) return;
        const clone = wrapper.cloneNode(true);
        clone.style.marginLeft = "0.5rem";
        wrapper.insertAdjacentElement("afterend", clone);
        const clonedInput = clone.querySelector('input[data-property-id]');
        if (clonedInput) {
            var oldData = localStorage.getItem(oldcode); // kiểm tra xem trước đó có lưu không
            var parsedData = oldData ? JSON.parse(oldData) : null;
            var defaultvalue = parsedData ? parsedData.lot : 100;
            clonedInput.value = defaultvalue;
            setvalue(defaultvalue);
            clonedInput.addEventListener("input", function() {
                if (typeof onChangeHandler === "function") {
                    onChangeHandler(this.value, clonedInput);
                }
            });
        }
    }
    // nhân đôi thẻ pricelot => nhập số cổ phiếu
    duplicateInputWrapper("Risk/RewardlongEntryPrice", (newValue, inputEl) => {
        setvalue(newValue);
    });
    // đặt giá trị theo số lot
    function setvalue(newValue) {
        // AccountSize
        const accountSizeInputs = iframeDoc.querySelectorAll('input[data-property-id="Risk/RewardlongAccountSize"]');
        if (accountSizeInputs.length > 1) {
            accountSizeInputs[1].value = Math.round(newValue * price); // gán cho ô nhân đôi
            accountSizeInputs[1].dispatchEvent(new Event('input', {
                bubbles: true
            }));
        }
        // stoploss
        const entryPriceInputs = iframeDoc.querySelectorAll('input[data-property-id="Risk/RewardlongLotSize"]');
        if (entryPriceInputs.length > 1) {
            entryPriceInputs[1].value = Math.round(stoploss * newValue / 100);
            entryPriceInputs[1].dispatchEvent(new Event('input', {
                bubbles: true
            }));
        }
        // lưu lại
        localStorage.setItem(oldcode, JSON.stringify({
            gia: price,
            lot: newValue
        }));
    }
}
//======= Load dữ liệu tin tức và chèn nút nâng cao ==============//
function loadDataForCode() {
    const el = document.querySelector('.layout__tab_button_content');
    if (el) {
        const text = el.textContent.trim();
        const code = text.split(" ")[0];
        if (oldcode !== code) {
            oldcode = code;
        }
        else {
            return;
        }
    }
    else {
        //console.log("Không thấy tab_button");
    }
    const raw = localStorage.getItem("oidc.user:https://accounts.fireant.vn:fireant.tradestation");
    if (!raw) {
        //console.error("Không tìm thấy token trong localStorage!");
        return;
    }
    const obj = JSON.parse(raw);
    const accessToken = obj.access_token;
    fetch(`https://restv2.fireant.vn/symbols/${oldcode}/timescale-marks?startDate=2024-12-11&endDate=2037-01-01`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    }).then(res => res.json()).then(data => {
        const iframe = document.querySelector('[id^="chart_"] iframe');
        if (!iframe) {
            console.log("Không tìm thấy iframe");
            return;
        }
        insertSetingCustiom();
        // Khi iframe load xong thì gắn observer với data mới
        iframe.addEventListener("load", () => {
            startObserve(iframe, data);
        });
        // Nếu iframe đã load sẵn thì gọi ngay
        if (iframe.contentDocument?.readyState === "complete") {
            startObserve(iframe, data);
        }
    }).catch(err => console.error(err));
}
// thay thế => nội dung sự kiện
function startObserve(iframe, data) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    // Nếu đã có observer cũ thì ngắt nó
    if (currentObserver) {
        currentObserver.disconnect();
        currentObserver = null;
    }
    const observer = new MutationObserver(() => {
        const root = iframeDoc.getElementById("overlap-manager-root");
        if (!root) return;
        const popup = root.querySelector('[data-name="popup-menu-container"]');
        if (!popup) return;
        const innerBox = popup.querySelector('[data-name="menu-inner"]');
        if (!innerBox) return;
        const targetDiv = innerBox.querySelector('div > div > div > div > div > div');
        if (!targetDiv) return;
        if (!targetDiv.innerText.includes("Nâng cấp lên bản PRO")) return;
        popup.style.top = "40px";
        popup.style.left = "50px";
        popup.style.maxHeight = "380px";
        popup.style.height = "100%";
        replacePopupContent(targetDiv, data);
    });
    observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true
    });
    // Lưu lại observer hiện tại
    currentObserver = observer;
}

function replacePopupContent(innerBox, data) {
    const margDiv = innerBox.parentElement.parentElement;
    margDiv.style.marginRight = "-4px";
    let html = `
    <div style="font-size:14px;">
      <div style="font-weight:bold; margin-bottom:8px;">
        Nội dung sự kiện: ${oldcode}
      </div>  `;

    data.slice().reverse().forEach(item => {
        html += `
      <div style="padding:4px 0;">
      • ${item.title}
       </div>  `;
    });
    html += `</div>`;
    innerBox.innerHTML = html;
}
// thêm nút chức năng => click mở bảng phân tích
function insertSetingCustiom() {
    // Lấy tất cả div có class layout__tab_header_outer > div.layout__tab_toolbar
    const toolbars = document.querySelectorAll('.layout__tab_header_outer > .layout__tab_toolbar');
    // Giả sử bạn muốn thao tác trên toolbar đầu tiên
    const toolbar = toolbars[0];
    // Lấy tất cả button bên trong toolbar
    const buttons = toolbar.querySelectorAll('.bp5-popover-target');
    if (buttons.length > 3) return; // không cho tạo quá 3
    // Đối tượng thứ 2 (index = 1)
    const secondButton = buttons[1];
    // Clone đối tượng này
    const clonedButton = secondButton.cloneNode(true);
    const iconSpan = clonedButton.querySelector('.bp5-icon');
    if (iconSpan) {
        // Xóa nội dung cũ
        iconSpan.innerHTML = '';
        // Thêm SVG biểu đồ
        iconSpan.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" width="24" height="22" fill="none"><g class="normal-eye"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M17.9948 7.91366C16.6965 6.48549 14.6975 5 11.9999 5C9.30225 5 7.30322 6.48549 6.00488 7.91366C6.00488 7.91366 4 10 4 11C4 12 6.00488 14.0863 6.00488 14.0863C7.30322 15.5145 9.30225 17 11.9999 17C14.6975 17 16.6965 15.5145 17.9948 14.0863C17.9948 14.0863 20 12 20 11C20 10 17.9948 7.91366 17.9948 7.91366ZM6.74482 13.4137C7.94648 14.7355 9.69746 16 11.9999 16C14.3022 16 16.0532 14.7355 17.2549 13.4137C17.2549 13.4137 19 11.5 19 11C19 10.5 17.2549 8.58634 17.2549 8.58634C16.0532 7.26451 14.3022 6 11.9999 6C9.69746 6 7.94648 7.26451 6.74482 8.58634C6.74482 8.58634 5 10.5 5 11C5 11.5 6.74482 13.4137 6.74482 13.4137Z"></path><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z"></path></g><g class="loading-eye"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M17.9948 7.91366C16.6965 6.48549 14.6975 5 11.9999 5C9.30225 5 7.30322 6.48549 6.00488 7.91366C6.00488 7.91366 4 10 4 11C4 12 6.00488 14.0863 6.00488 14.0863C7.30322 15.5145 9.30225 17 11.9999 17C14.6975 17 16.6965 15.5145 17.9948 14.0863C17.9948 14.0863 20 12 20 11C20 10 17.9948 7.91366 17.9948 7.91366ZM6.74482 13.4137C7.94648 14.7355 9.69746 16 11.9999 16C14.3022 16 16.0532 14.7355 17.2549 13.4137C17.2549 13.4137 19 11.5 19 11C19 10.5 17.2549 8.58634 17.2549 8.58634C16.0532 7.26451 14.3022 6 11.9999 6C9.69746 6 7.94648 7.26451 6.74482 8.58634C6.74482 8.58634 5 10.5 5 11C5 11.5 6.74482 13.4137 6.74482 13.4137Z"></path></g><g class="animated-loading-eye"><path stroke="currentColor" stroke-linecap="round" d="M14.5 11C14.5 9.61929 13.3807 8.5 12 8.5C10.6193 8.5 9.5 9.61929 9.5 11C9.5 12.3807 10.6193 13.5 12 13.5"></path></g></svg>
  `;
    }
    // Thêm clone vào toolbar
    toolbar.appendChild(clonedButton);
    clonedButton.addEventListener("click", debounce(() => fetchData(oldcode),300));
    //const overlay = document.querySelectorAll("div.bp5-overlay[aria-live='polite']");
    const overlay = document.createElement("div");
    overlay.className = "bp5-overlay";
    overlay.setAttribute("aria-live", "polite");
    document.body.appendChild(overlay);
    let isShow = false;
    clonedButton.addEventListener("mouseover", async(event) => {
        const target = event.target;
        if (overlay && !isShow) {
            const rect = target.getBoundingClientRect();
            const container = document.createElement("div");
            container.className = "bp5-popover-transition-container bp5-overlay-content bp5-popover-enter-done";
            container.style.position = "absolute";
            container.style.top = `52px`;
            container.style.left = `${rect.left-200}px`;
            // Nội dung popover
            container.innerHTML = `
        <div class="bp5-popover bp5-dark bp5-popover-placement-left bp5-tooltip" style="transform-origin: right 23px;">
          <div aria-hidden="true" class="bp5-popover-arrow" data-popper-arrow="true" style="position: absolute; top: 8px; right: -11px;">
            <svg viewBox="0 0 30 30" style="transform: rotate(180deg);">
              <path class="bp5-popover-arrow-border" d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"></path>
              <path class="bp5-popover-arrow-fill" d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"></path>
            </svg>
          </div>
          <div class="bp5-popover-content">Phân tích mức chiết khấu</div>
        </div>
      `;
            overlay.innerHTML = "";
            await overlay.appendChild(container);
            isShow = true;
        }
    });
    clonedButton.addEventListener("mouseleave", () => {
        if (overlay && isShow) {
            overlay.innerHTML = "";
            isShow = false;
        }
    });
}
