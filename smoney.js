
let  ckht = '';

// áp dụng với phân tích cổ phiếu
setTimeout(function() {

    const target = document.querySelector(".symbol-chart");
    const url = window.location.href;
    const path = new URL(url).pathname; // "/quy-dau-tu/DCDE"
    const fundCode = path.split("/").pop(); // "DCDE"
    if (!target) return;
    const original = document.createElement("div");
    original.setAttribute("class", "discount-chart position-relative m-3");
    target.parentNode.insertBefore(original, target.nextSibling);
    const buttons = document.createElement("div");
    buttons.setAttribute("class", "time-chart2 time-chart btn-chart d-inline-flex gap-1 gap-sm-2");
    buttons.innerHTML = `<button class="" data-size="1N">1Y</button>
    <button class="" data-size="3N">3Y</button>
    <button class="" data-size="5N">5Y</button>
    <button class="active" data-size="">All</button>`;
    if (fundCode.length == 3) {
        // tiêu đề
        const h3 = document.createElement("h3");
        h3.setAttribute("class", "title-symbol");
        h3.innerText = "Phân tích chiết khấu cổ phiếu " + fundCode;
        // biểu đồ
        const clone = document.createElement("div");
        clone.id = "candles-chart2";
        clone.style.height = "400px"
        original.appendChild(h3);
        original.appendChild(buttons);
        original.appendChild(clone);
        fetchData(fundCode, original);
    }
    else if (fundCode.length >3) {
  const tabProfile = document.querySelector('.tab-profile');
  const infoProfile = document.querySelector('.info-profile');
  infoProfile.style.display = 'none';
  tabProfile.addEventListener('click', function() {
    if (infoProfile.style.display === 'none' || infoProfile.style.display === '') {
      infoProfile.style.display = 'block'; // hiện
    } else {
      infoProfile.style.display = 'none'; // ẩn
    }
  });
        const h3 = document.createElement("h3");
        h3.setAttribute("class", "title-symbol");
        h3.innerText = "Phân tích chiết khấu quỹ " + fundCode;
        const clone = document.createElement("div");
        clone.id = "candles-chart2";
        clone.style.height = "400px";
        original.appendChild(h3);
        original.appendChild(buttons);
        original.appendChild(clone);
        fetchFundData(fundCode, original);
    }
}, 1000);

// ===  chức năng phân tích sụt giảm
async function fetchData(code, originalDiv) {
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
        if (!closep.length) {
            originalDiv.remove();
            return;
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
        let table = renderResults(drawdown.slice(-20)); // bảng dữ liệu
        const mockResult = `Mức chiết khấu TB (n = ${ci.n}) là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci.mean.toFixed(2)}%  [${ci.lowerBound.toFixed(2)}, ${ci.upperBound.toFixed(2)}]</span>. <br/>Mức hồi phục TB (n = ${ci2.n}) là <span style="padding: 2px; color: rgb(0, 170, 0);">${ci2.mean.toFixed(2)}% [${ci2.lowerBound.toFixed(2)}, ${ci2.upperBound.toFixed(2)}]</span><br/> ${ckht}</p></div>${table}`;
        // tính phiên chạy nước rút
        const resultMe = checkLatestGrowth(closep);
        if (resultMe.length > 0) {
            originalDiv.innerHTML += `<div class="caption"><p>📊 Chú ý phiên chạy nước rút:<br/>` + resultMe.join('<br/>') + '<br/>' + mockResult;
        }
        else {
            originalDiv.innerHTML += `<div class="caption"><p>`+mockResult;
        }
        const temp = drawdown;
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
        renderChart(arrayData);
        console.log(arrayData);
    }
    catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        showCopiedAlert("", 1, "Đã có lỗi không tải được dữ liệu, kiểm tra và thử lại!")
    }
}

function showCopiedAlert(a, b, c, d) {
    alert(c);
}

function renderChart(data) {
    if (!data || data.length === 0) return;
    // 1. Chuẩn bị dữ liệu
    const categories = data.map(d => d.date);
    const priceData = data.map(d => d.price);
    // ===== Linear Regression (Trendline) =====
    function linearRegression(yValues) {
        const n = yValues.length;
        let sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumXX = 0;
        yValues.forEach((y, x) => {
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
    const trendlineData = priceData.map((_, i) => slope * i + intercept);
    // 2. Xử lý DOM và Instance
    const chartId = 'candles-chart2';
    const chartDom = document.getElementById(chartId);
    if (chartDom) {
        let myChart = echarts.getInstanceByDom(chartDom);
        // Khởi tạo mới
        myChart = echarts.init(chartDom);
        const isDark = false;
        const colors = {
            text: isDark ? '#ffffff' : '#1c2127',
            grid: isDark ? '#444444' : '#efefef',
            tooltipBg: isDark ? '#333333' : '#ffffff'
        };
        const option = {
            backgroundColor: 'transparent',
color: ["#00DDFF", "#80FFA5", "#37A2FF", "#FF0087", "#FFBF00", "#aa66cc", "#66cccc", "#34495e"],
            grid: {
                top: '10%',
                left: '5%',
                right: '5%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                show: true,
                data: categories,
                axisPointer: {
                    show: true,
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(100, 100, 255, 0.15)'
                    }
                }
            },
            yAxis: {
                type: 'value',
 		splitLine: {
                            show: !0,
                            lineStyle: {
                                type: "dashed",
                                color: "#99999959",
                                width: 1
                            }
                        },
                min: 'dataMin',
                max: 'dataMax',
                axisLabel: {
                    color: 'grey',
                    formatter: function(value) {
                        return Math.floor(value);
                    }
                },
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                backgroundColor: colors.tooltipBg,
                textStyle: {
                    color: colors.text,
                    fontSize: 12
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        show: false
                    },
                    lineStyle: {
                        color: 'grey',
                        type: 'dashed'
                    }
                },
                // HIỂN THỊ NỘI DUNG TOOLTIP TỪ DATA GỐC
                formatter: function(params) {
                    const idx = params[0].dataIndex;
                    const item = data[idx];
                    return `<b>${item.date}</b><br/>Giá: ${item.price.toFixed(2)}<br/>${item.change}`;
                }
            },
            series: [{
                name: 'Trendline',
                type: 'line',
                data: trendlineData,
                symbol: 'none',
                lineStyle: {
                    type: 'dashed',
                    color: 'grey',
                    width: 1,
                    opacity: 0.6
                },
                silent: true // Trendline không chặn sự kiện hover của đường chính
            }, {
                name: 'Giá',
                type: 'line',
                data: priceData,
                color: 'deepskyblue',
                lineWidth: 2,
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: false,
                emphasis: {
                    scale: true,
                    itemStyle: {
                        color: '#ffffff',
                        borderColor: 'deepskyblue',
                        borderWidth: 2
                    }
                }
            }]
        };
        // Vẽ biểu đồ với tham số true (notMerge)
        myChart.setOption(option, true);
        // Resize xử lý gọn gàng
        const handleResize = () => myChart && myChart.resize();
        window.removeEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);

        function parseDate(str) {
            const [d, m, y] = str.split('/').map(Number);
            return new Date(y, m - 1, d);
        }
        // Hàm xử lý sự kiện click chỉnh thời gian
        document.querySelectorAll('.time-chart2 button').forEach(btn => {
            btn.addEventListener('click', function() {
                const size = this.getAttribute('data-size');
                // Cập nhật giao diện nút bấm
                const activeBtn = document.querySelector('.time-chart2 .active');
                if (activeBtn) activeBtn.classList.remove('active');
                this.classList.add('active');
                let startIndex = 0;
                const totalPoints = categories.length;
                if (size !== "" && totalPoints > 0) {
                    const lastDateObj = parseDate(categories[totalPoints - 1]);
                    let targetDate = new Date(lastDateObj);
                    // Tính toán mốc thời gian lùi lại
                    if (size === "1N") targetDate.setFullYear(lastDateObj.getFullYear() - 1);
                    else if (size === "3N") targetDate.setFullYear(lastDateObj.getFullYear() - 3);
                    else if (size === "5N") targetDate.setFullYear(lastDateObj.getFullYear() - 5);
                    startIndex = categories.findIndex(d => parseDate(d) >= targetDate);
                    if (startIndex === -1) startIndex = 0;
                }
                // Dùng setOption để "vẽ lại" vùng hiển thị
                myChart.setOption({
                    dataZoom: [{
		        show:false,
                        startValue: startIndex,
                        endValue: totalPoints - 1
                    }]
                });
            });
        });
    }
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
        ckht += ` <span title="Đang hồi phục sau chiết khấu">HIỆN TẠI</span> đang chiết khấu từ đỉnh ${formatTimestamp(tpeak)}: <span style="padding: 2px; color: rgb(0, 170, 0);" >${gg}% </span>.<br/>${temp}<br/>${predict(output, gg)}`;
    }
    else {
        let gg = output[output.length - 1].drawdown.toFixed(2);
        temp = ` Hồi phục từ đáy ${results[results.length-1].bottomDate}: <span style="padding: 2px; color: rgb(0, 170, 0);">${results[results.length-1].recover.toFixed(2)}</span>%.`;
        ckht += `Mức chiết khấu của <span title="Đang xu hướng tăng hoặc đi ngang"> đỉnh gần nhất </span>${output[output.length-1].startDate}: <span style="padding: 2px; color: rgb(0, 170, 0);" >${gg}%</span>.<br/>${temp}<br/>${predict(output, gg)}`;
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
    let table = `<div class="table-data draggable" style="    height: 300px;    overflow: scroll;">
<table id="resultsTable" class="table table-hover" style="">
        <thead>
            <tr>
                <th style=" ">Tạo đỉnh</th>
                <th style=" ">Giá</th>
                <th style=" ">Tạo đáy</th>
                <th style=" ">Giá</th>
                <th style=" ">Chiết khấu</th>
                <th style=" ">Hồi phục</th>
            </tr>
        </thead>
        <tbody>`;
    results.forEach(result => {
        table += `<tr>
            <td style=" ;">${result.startDate}</td>
            <td style=" ;">${result.start.toFixed(0)}</td>
            <td style=" ;">${result.bottomDate}</td>
            <td style=" ;">${result.bottom.toFixed(0)}</td>
            <td style=" ;">${result.drawdown.toFixed(2)} %</td>
            <td style=" ;">${result.recover.toFixed(2)} %</td>
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
    let probabilitys = findRecoveryLevel(data)?.recover || 0

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
    return `<i>Mức hồi phục dự báo là:<span style="padding: 2px; color: rgb(0, 170, 0);"> ${probabilitys.toFixed(2)}% </span>(xs 90%)</i><br/>------<br/>Hệ số tương quan: ${correlation.toFixed(2)}. Hệ số hồi quy: Slope = ${regression.slope.toFixed(2)}, Intercept = ${regression.intercept.toFixed(2)}. Giá trị t: ${tValue.toFixed(2)}.<br/> Mối tương quan ${significant} ý nghĩa thống kê.<br/>`;
}
// ===========áp dụng với phân tích chứng chỉ quỹ
async function fetchFundData(fundCode, originalDiv) {
    const convertToUnix = (dateString) => {
        const date = new Date(dateString);
        return Math.floor(date.getTime() / 1000);
    };
    try {
        const url = `https://smoney.com.vn/quy-dau-tu/${fundCode}`;
        const t = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-csrftoken": t
            },
            body: JSON.stringify({
                type: "nav_ccq"
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let closep = [];
        for (let i = 0; i < data.data.length; i++) {
            closep.push({
                "time": convertToUnix(data.data[i].navDate),
                "value": data.data[i].nav
            });
        }
        if (!closep.length) {
            originalDiv.remove();
            return;
        }
        const drawdown = findRecoveries(closep);
        const sampleData = drawdown.slice(1).map(d => d.drawdown);
        const sampleData2 = drawdown.slice(1).map(d => d.recover);
        const ci = calculateConfidenceInterval(sampleData);
        const ci2 = calculateConfidenceInterval(sampleData2);
        let table = renderResults(drawdown.slice(-20));
        // Ghi nội dung phân tích vào div
        const analysisHtml = `<div class="caption"><p>Mức chiết khấu TB (n = ${ci.n}) là <span style="color: #00aa00;">${ci.mean.toFixed(2)}% [${ci.lowerBound.toFixed(2)}, ${ci.upperBound.toFixed(2)}]</span>. <br/>Mức hồi phục TB (n = ${ci2.n}) là <span style="color: #00aa00;">${ci2.mean.toFixed(2)}% [${ci2.lowerBound.toFixed(2)}, ${ci2.upperBound.toFixed(2)}]</span><br/> ${ckht}</p></div>${table}`;
        // Chuẩn bị dữ liệu cho biểu đồ (giữ nguyên logic gốc)
        const temp = drawdown;
        let arrayData = [];
        for (let i = 1; i < temp.length; i++) {
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
        let endValue = closep[closep.length - 1].value;
        let endArrayValue = arrayData[arrayData.length - 1].price;
        arrayData.push({
            date: formatTimestamp(closep[closep.length - 1].time),
            price: endValue,
            change: (endValue > endArrayValue ? "▲" : "▼") + ((endValue / endArrayValue - 1) * 100).toFixed(2) + "%"
        });
        originalDiv.innerHTML += analysisHtml;
        renderChart(arrayData);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// lấy danh mục cổ phiếu của quỹ trên web
// Hàm làm sạch dữ liệu số
function parseFinanceValue(val) {
    if (val == null) return 0;
    const clean = String(val).replace(/,/g, '').replace('%', '').trim();
    return (clean === '-' || clean === '' || Number.isNaN(Number(clean))) ? 0 : Number(clean);
}

function getPortfolioFromDOM() {
    // Tìm bảng nằm trong div có class portfolio-table
    const table = document.querySelector('.portfolio-table table.table-hover');
    if (!table) {
        console.error("Không tìm thấy bảng dữ liệu!");
        return [];
    }
    const rows = table.querySelectorAll('tbody tr');
    const data = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        // Kiểm tra nếu dòng không có dữ liệu mã cổ phiếu thì bỏ qua
        if (cells.length < 2 || !cells[2].querySelector('span')) return null;
        if (cells.length < 7) return null;
        return {
            symbol: cells[2].querySelector('span').innerText.trim(),
            quantity: parseFinanceValue(cells[3].innerText),
            changeAmount: parseFinanceValue(cells[4].innerText),
            changePercent: cells[5].innerText.trim(), // Giữ string vì có thể là "mua mới" hoặc "thoái vốn"
            currentValue: parseFinanceValue(cells[6].innerText), // Tỷ đồng
            ratio: parseFinanceValue(cells[7].innerText) // % GAV
        };
    }).filter(item => item !== null);
    return data;
}
// lấy dữ liệu biến động hàng ngày của một mã cổ phiếu (ví dụ MWG) trong 5 ngày gần nhất
async function getStockHistory(ticker) {
    const url = `https://api.simplize.vn/api/historical/prices/ohlcv?ticker=${ticker}&size=5&interval=1d&type=stock`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.status !== 200 || !result.data) {
            throw new Error(result.message || "Không lấy được dữ liệu");
        }
        // result.data là mảng các [timestamp, open, high, low, close, volume]
        const processedData = result.data.map((item, index, array) => {
            const timestamp = item[0] * 1000; // Chuyển sang miliseconds cho JS Date
            const closePrice = item[4];
            let changeAmount = 0;
            let changePercent = 0;
            // Tính toán so với ngày hôm trước (nếu có)
            if (index > 0) {
                const prevClose = array[index - 1][4];
                changeAmount = closePrice - prevClose;
                changePercent = (changeAmount / prevClose) * 100;
            }
            return {
                date: new Date(timestamp).toLocaleDateString('vi-VN'),
                close: closePrice,
                change: changeAmount,
                percent: changePercent.toFixed(2) // Làm tròn 2 chữ số thập phân
            };
        });
        return processedData;
    }
    catch (error) {
        console.error(`Lỗi khi lấy dữ liệu mã ${ticker}:`, error);
        return [];
    }
}
let latestDateNav;
async function calculateTotalPortfolioChange(portfolio, i = 1) {

    const fetchPromises = portfolio.map(item => getStockHistory(item.symbol).then(history => ({
        symbol: item.symbol,
        quantity: item.quantity,
        ratio: item.ratio,
        history: history
    })));

    const results = await Promise.all(fetchPromises);
    // 3. Tính toán tổng giá trị biến động
    let allChange = 0;
    results.forEach(res => {

        if (res.history && res.history.length > 0) {
            const latestData = res.history[res.history.length - i];
            allChange += res.quantity * latestData.change;
            latestDateNav = latestData.date;
            const portfolioItem = portfolio.find(item => item.symbol === res.symbol);
            if (portfolioItem) {
                portfolioItem.change = latestData.change;
                portfolioItem.changeP = latestData.percent;
            }
        }
    });
    return Number(allChange.toFixed(0));
}

function getNextDateFromLocaleString(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('vi-VN');
}

function formatNumber(n) {
    // Nếu được truyền vào chuỗi số (ví dụ "-12345"), chuyển về kiểu số
    const num = typeof n === 'string' ? Number(n.replace(/,/g, '').trim()) : n;
    if (typeof num !== 'number' || Number.isNaN(num)) return String(n);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    if (abs >= 1_000_000_000) {
        return sign + (abs / 1_000_000_000).toFixed(2) + " tỷ";
    }
    else if (abs >= 1_000_000) {
        return sign + (abs / 1_000_000).toFixed(2) + " triệu";
    }
    else if (abs >= 1_000) {
        return sign + (abs / 1_000).toFixed(2) + " nghìn";
    }
    else {
        return sign + abs.toString();
    }
}
// Hàm này sẽ lấy giá trị NAV từ phần tử HTML, làm sạch nó và chuyển đổi thành số thực
function parseNAV(value) {
    if (!value) return null;
    return parseFloat(value.replace(/,/g, '').replace('T', '')) * 1_000_000_000;
}
(async () => {
    const portfolio = getPortfolioFromDOM(); // Lấy danh mục từ bảng HTML trước đó
    if (portfolio.length === 0) {
        console.log("Danh mục trống hoặc không lấy được dữ liệu!");
        return;
    }
    const totalChangeNAVpre = await calculateTotalPortfolioChange(portfolio,2);
    const totalChangeNAV = await calculateTotalPortfolioChange(portfolio);
    console.clear();
    console.table(portfolio); // Hiển thị dạng bảng danh mục trong console cho dễ nhìn
    console.log(`Biến động toàn danh mục hôm nay: ${formatNumber(totalChangeNAV)}`);
    console.log(`Biến động toàn danh mục hôm qua: ${formatNumber(totalChangeNAVpre)}`);
    // Lấy phần tử chứa NAV
    const navElement = document.querySelector('.total-assets.flex-between .value');
    const navValue = navElement ? navElement.textContent.trim() : null;
    if (navValue) {
        const currentNAV = parseNAV(navValue);
        console.log(`NAV hiện tại: ${formatNumber(currentNAV)}`);
        console.log(`Hôm qua NAV%: ${((totalChangeNAVpre / (currentNAV-totalChangeNAVpre)) * 100).toFixed(2)} %`);
        console.log(`Dự kiến NAV%: ${((totalChangeNAV / (currentNAV+totalChangeNAV)) * 100).toFixed(2)} %`);

        // Lấy tất cả các div con bên trong .portfolio-metrics
        const items = document.querySelectorAll('.portfolio-metrics > div>div');
        let str = `(${getNextDateFromLocaleString(latestDateNav)})`;
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            const parent = lastItem.parentNode;

            // Cấu hình cho hai clone mới
            const configs = [{
                label: "\u0394NAV ("+latestDateNav+")",
                value: formatNumber(totalChangeNAVpre)
            }, {
                label: "\u0394NAV% ("+latestDateNav + ")",
                value: ((totalChangeNAVpre / (currentNAV-totalChangeNAVpre)) * 100).toFixed(2) + " %"
            },{
                label: "\u0394NAV " + str,
                value: formatNumber(totalChangeNAV)
            }, {
                label: "\u0394NAV% " + str,
                value: ((totalChangeNAV / (currentNAV + totalChangeNAV)) * 100).toFixed(2) + " %"
            }];
    	    let funds_= JSON.parse(document.getElementById('funds-performance-ytd').textContent);
            configs.forEach(config => {
                const clone = lastItem.cloneNode(true);
		clone.addEventListener('click', async () => {
		if (confirm("Bạn có muốn hiển thị danh sách quỹ mở không?")) {
			const l = document.createElement("div");
			l.setAttribute("class","ty-ajax-loading-box");
			l.setAttribute("style","display:block; position:fixed;");
			parent.parentNode.appendChild(l);
			console.clear();
		        console.log("Đang lấy danh sách...");
			await updateAllFunds(funds_);
			l.remove();	
                parent.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });	
		}
		});
                const label = clone.querySelector('.metric-label');
                if (label) label.textContent = config.label;
                const value = clone.querySelector('.metric-value');
                if (value) {
                    value.textContent = config.value;
                    value.style.color = config.value.startsWith('-') ? 'red' : 'green'; // Màu đỏ nếu âm, xanh nếu dương
                }
                parent.appendChild(clone);
                parent.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        }
    }
    else {
        console.error("Không tìm thấy phần tử NAV!");
        return;
    }
})();

// biểu đồ so sánh chứng chỉ quỹ
let x = [],
    E = 365;
let currentCodes = [],
    d = document.getElementById("compare-result"),
    h = document.getElementById("compare-empty"),
    u = document.getElementById("compare-head-row"),
    g = document.getElementById("compare-tbody"),
    m = document.getElementById("compare-loading");

document.addEventListener("click", async (e) => {
    let Codes = getFundCodes();
    if (arraysEqual(Codes, currentCodes)) {
        return;
    }
    currentCodes = Codes;
    const promises = currentCodes.map(s => fetchFundNavData(s));
    x = await Promise.all(promises);
    console.log(x)
    const perfTab = document.getElementById("performance-tab");
    const tableTab = document.getElementById("compare-table-tab");

    if (e.target === perfTab || perfTab?.classList.contains("active")) {
        N(E);
    } else if (e.target === tableTab || tableTab?.classList.contains("active")) {
         currentCodes.length >= 4 && TT(currentCodes); // vẽ bảng
    }

});


function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function getFundCodes() {
    const tags = document.querySelectorAll("#selected-funds-tags .fund-tag");
    return Array.from(tags).map(tag => {
        // Lấy text node đầu tiên (trước nút xóa)
        return tag.childNodes[0].textContent.trim();
    });
}
async function fetchFundNavData(fundCode) {
    try {
        const url = `https://smoney.com.vn/quy-dau-tu/${fundCode}`;
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        if (!tokenElement) {
            throw new Error("CSRF token not found in meta tag");
        }
        const csrfToken = tokenElement.getAttribute("content");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({
                type: "nav_ccq"
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return {
            fund_code: fundCode,
            data: data.data
        };
        //
    }
    catch (error) {
        console.error("Error fetching NAV data:", error.message);
        return null;
    }
}

function N(t) {
    const chartDom = document.getElementById("performance-chart");
    if (!chartDom) return;
    const filterDate = t ? new Date(Date.now() - 864e5 * t).toISOString().split("T")[0] : null;
    const allDates = new Set();
    const performanceMap = {};
    const fundCodes = [];
    x.forEach(fundObj => {
        const code = fundObj.fund_code;
        fundCodes.push(code);
        performanceMap[code] = {};
        const rawData = fundObj.data || [];
        const sortedData = rawData.sort((a, b) => a.navDate.localeCompare(b.navDate));
        const filtered = filterDate ? sortedData.filter(d => d.navDate >= filterDate) : sortedData;
        if (filtered.length > 0) {
            const baseNav = filtered[0].nav;
            filtered.forEach(item => {
                allDates.add(item.navDate);
                if (baseNav && item.nav != null) {
                    const percentChange = ((item.nav - baseNav) / baseNav) * 100;
                    performanceMap[code][item.navDate] = percentChange;
                }
                else {
                    performanceMap[code][item.navDate] = 0;
                }
            });
        }
    });
    const sortedDates = Array.from(allDates).sort();
    const chartColors = ["#cf1421", "#f9943c", "#007049", "#7cb302", "#2f4eeb", "#541cab", "#8e9775", "#f1c40f", "#e74c3c", "#2ecc71", "#5eb5ef", "#9b59b6", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b", "#7f8c8d", "#2c3e50", "#34495e", "#95a5a6", "#ecf0f1", "#16a085", "#d35400", "#1abc9c", "#f1c40f", "#9b59b6", "#2ecc71", "#e67e22"];
    const seriesData = fundCodes.map((code, index) => ({
        name: code,
        type: "line",
        connectNulls: true,
        symbol: "none",
        smooth: true,
        data: sortedDates.map(date => {
            return performanceMap[code][date] !== undefined ? performanceMap[code][date] : null;
        }),
        itemStyle: {
            color: chartColors[index % chartColors.length]
        },
        lineStyle: {
            width: 2
        },
        emphasis: {
            focus: "series"
        }
    }));
    if (typeof w !== 'undefined' && w) {
        w.dispose();
    }
    w = echarts.init(chartDom);
    const option = {
        tooltip: {
            trigger: "axis",
            formatter: (params) => {
                const date = params[0].axisValue;
                const d = date.split("-");
                let str = `<b>${d[2]}/${d[1]}/${d[0]}</b><br/>`;
                params.forEach(p => {
                    const val = p.data !== null ? p.data.toFixed(2) + "%" : "N/A";
                    str += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
                });
                return str;
            }
        },
        legend: {
            bottom: 0,
            data: fundCodes,
            type: "scroll"
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: sortedDates,
            axisLabel: {
                formatter: (val) => {
                    const d = val.split("-");
                    return `${d[1]}/${d[0]}`;
                }
            }
        },
        yAxis: {
            type: "value",
            axisLabel: {
                formatter: '{value}%'
            },
            scale: true // Tự động điều chỉnh trục Y theo biên độ dữ liệu
        },
        series: seriesData
    };
    w.setOption(option);
    window.addEventListener("resize", () => w?.resize());
    m.classList.add("d-none"),
        d.classList.remove("compare-hidden"),
        h.classList.add("d-none");
}
document.querySelector(".performance-chart")?.addEventListener("click", e => {
    const t = e.target.closest("[data-days]");
    t && (document.querySelectorAll(".performance-chart [data-days]").forEach(e => e.classList.remove("active")), t.classList.add("active"), E = parseInt(t.dataset.days), N(E))
});

function splitArray(input, minSize = 2, maxSize = 3) {
    const result = [];
    let i = 0;
    while (i < input.length) {
        let remaining = input.length - i;
        // Nếu còn lại 1 phần tử thì gộp vào nhóm trước đó
        if (remaining === 1) {
            result[result.length - 1].push(input[i]);
            break;
        }
        // Nếu còn lại 4 phần tử thì chia thành 2 nhóm 2
        if (remaining === 4) {
            result.push(input.slice(i, i + 2));
            result.push(input.slice(i + 2, i + 4));
            break;
        }
        // Ngược lại, lấy tối đa 3 phần tử
        const size = Math.min(maxSize, remaining);
        result.push(input.slice(i, i + size));
        i += size;
    }
    return result;
}

function B(e) {
    const t = parseFloat(e);
    return isNaN(t) ? "—" : t >= 1e12 ? (t / 1e12).toFixed(2) + " nghìn tỷ" : t >= 1e9 ? (t / 1e9).toFixed(0) + " tỷ" : t >= 1e6 ? (t / 1e6).toFixed(0) + " triệu" : t.toLocaleString("vi-VN")
}
let f = [],
    y = [],
    v = null,
    b = null,
    w = null;
let p = document.getElementById("compare-date-note");
const S = [{
    section: "Thông tin cơ bản"
}, {
    key: "fund_type",
    label: "Loại quỹ",
    format: e => e || "—",
    highlight: null
}, {
    key: "total_assets",
    label: "Tổng tài sản",
    format: e => null != e ? B(e) : "—",
    highlight: "high"
}, {
    key: "listed_shares",
    label: "Danh mục cổ phiếu",
    format: e => null != e ? B(e) : "—",
    highlight: "high"
}, {
    key: "annualized_return",
    label: "Hiệu suất CAGR (*)",
    format: e => null != e ? `${e}%` : "—",
    highlight: "high"
}, {
    key: "management_fee",
    label: "Phí quản lý/năm",
    format: e => null != e ? `${e}%` : "—",
    highlight: "low"
}, {
    key: "performance_fee",
    label: "Phí hiệu suất",
    format: e => null != e ? `${e}%` : "—",
    highlight: null
}, {
    section: "Phí giao dịch"
}, {
    key: "buy_fee_range",
    label: "Phí mua",
    format: e => e || "—",
    highlight: "low"
}, {
    key: "sell_fee_range",
    label: "Phí bán",
    format: e => e || "—",
    highlight: "low"
}, {
    key: "switching_fee_range",
    label: "Phí chuyển đổi",
    format: e => e || "—",
    highlight: "low"
}, {
    section: "Chỉ số tài chính"
}, {
    key: "pe",
    label: "P/E",
    format: e => null != e ? e : "—",
    highlight: "low"
}, {
    key: "pb",
    label: "P/B",
    format: e => null != e ? e : "—",
    highlight: "low"
}, {
    key: "roe",
    label: "ROE",
    format: e => null != e ? `${e}%` : "—",
    highlight: "high"
}, {
    section: "Hệ số rủi ro"
}, {
    key: "beta",
    label: "Beta",
    format: e => null != e ? e : "—",
    highlight: null
}, {
    key: "sharpe",
    label: "Sharpe (*)",
    format: e => null != e ? e : "—",
    highlight: "high"
}, {
    key: "std",
    label: "Độ lệch chuẩn (*)",
    format: e => null != e ? `${e}%` : "—",
    highlight: "low"
}];
async function TT(codes) {
    const t = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    x = [],
        b && b.abort(),
        b = new AbortController,
        m.classList.remove("d-none"),
        d.classList.add("compare-hidden"),
        h.classList.add("d-none");
    let allCode = splitArray(codes);
    let ee = [];
    await Promise.all(allCode.map(group => fetch(window.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": t
        },
        body: JSON.stringify({
            fund_codes: group
        }),
        signal: b.signal
    }).then(res => res.json()))).then(results => {
        results.forEach(r => {
            ee.push(...r.data);
        });
        // console.log("Danh sách quỹ:", ee);
    });
    b = null,
        (function(e) {
            u.innerHTML = "";
            const t = document.createElement("th");
            t.className = "compare-col-label",
                t.textContent = "Chỉ tiêu",
                u.appendChild(t),
                e.forEach(e => {
                    const t = document.createElement("th");
                    t.className = "compare-fund-header";
                    const n = document.createElement("div");
                    n.className = "compare-fund-header-info";
                    const o = document.createElement("div");
                    o.className = "compare-fund-code text-center",
                        o.textContent = e.fund_code,
                        n.append(o);
                    const a = document.createElement("div");
                    a.className = "compare-fund-header-inner",
                        a.append(n),
                        t.appendChild(a),
                        u.appendChild(t)
                }),
                g.innerHTML = "",
                S.forEach(t => {
                    const n = document.createElement("tr");
                    if (t.section) {
                        n.className = "compare-section-row";
                        const o = document.createElement("td");
                        o.className = "compare-col-label",
                            o.textContent = t.section,
                            n.appendChild(o);
                        const a = document.createElement("td");
                        a.colSpan = e.length,
                            n.appendChild(a)
                    }
                    else {
                        n.className = "data-row";
                        const o = document.createElement("td");
                        o.className = "compare-col-label compare-row-label",
                            o.textContent = t.label,
                            n.appendChild(o);
                        const a = function(e, t) {
                            if (!t) return -1;
                            const n = e.map(Number),
                                o = n.filter(e => !isNaN(e));
                            if (o.length < 2) return -1;
                            const a = "high" === t ? Math.max(...o) : Math.min(...o);
                            return n.indexOf(a)
                        }(e.map(e => e[t.key]), t.highlight);
                        e.forEach((e, o) => {
                            const s = document.createElement("td"),
                                i = t.format(e[t.key]);
                            if ("—" === i) s.className = "compare-cell-null",
                                s.textContent = "—";
                            else {
                                const e = a === o;
                                s.className = e ? "compare-cell-value " + ("low" === t.highlight ? "compare-best-low" : "compare-best") : "compare-cell-value",
                                    s.textContent = i
                            }
                            n.appendChild(s)
                        })
                    }
                    g.appendChild(n)
                });
            const n = e.map(e => e.metrics_date).filter(Boolean).sort();
            p.textContent = n.length ? `Cập nhật theo giá đóng cửa ngày ${function(e) {
                        const t = e.split("-");
                        return 3 !== t.length ? e : `${t[2]}/${t[1]}/${t[0]}`
                    }(n.at(-1))}` : "",
                d.classList.remove("compare-hidden")
        }(ee), m.classList.add("d-none"))
}

// Tìm tất cả nút theo thuộc tính data-bs-target// khối ngoại
const btnAll = document.querySelectorAll('button[data-bs-target="#loginRequiredModal"]');
let dem = 0;
btnAll.forEach(btn => {
  // Xóa các thuộc tính cũ
  btn.removeAttribute('type');
  btn.removeAttribute('data-bs-toggle');
  btn.removeAttribute('data-bs-target');
  btn.removeAttribute('data-modal-type');

  let size = parseInt(btn.textContent, 10);

if(dem <4){
  // Thêm các thuộc tính mới
  btn.setAttribute('data-chart', 'trade-chart');
  btn.setAttribute('data-period', 'M');
  btn.setAttribute('data-size', 12 * size);
}else if(dem < 8){
  // Thêm các thuộc tính mới
  btn.setAttribute('data-chart', 'top-sell-chart');
  btn.setAttribute('data-period', getTodayFormatted());
  btn.setAttribute('data-size', 12 * size);
}else {
  // Thêm các thuộc tính mới
  btn.setAttribute('data-chart', 'top-buy-chart');
  btn.setAttribute('data-period', getTodayFormatted());
  btn.setAttribute('data-size', 12 * size);
}
dem++;
});
function getTodayFormatted() {
  const today = new Date();

  // Lấy ngày, tháng, năm
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
  const year = today.getFullYear();

  // Ghép lại theo định dạng dd-mm-yyyy#
  return `${year}-${month}-${day}`;
}


// chèn bảng thống kê quỹ mở để lọc trên excel
async function updateAllFunds(funds) {
const filteredFunds = funds.filter(fund => fund.fund_code !== "VNINDEX");

    for (const fund of filteredFunds) {
        try {
            const metrics = await fetchFundDataMetrics(fund.fund_code);
            if (metrics) {
                Object.assign(fund, metrics);
            }
        } catch (err) {
            console.error(`Lỗi cập nhật quỹ ${fund.fund_code}:`, err);
        }
    }
    console.table(filteredFunds);

 injectFundsTable(filteredFunds, '.portfolio-table');

}

async function fetchFundDataMetrics(fundCode) {
    try {
        const url = `https://smoney.com.vn/quy-dau-tu/${fundCode}`;
        
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const t = csrfMeta ? csrfMeta.getAttribute("content") : "";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-csrftoken": t
            },
            body: JSON.stringify({
                type: "portfolio_metrics"
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data || result; 
    } catch (e) {
        console.error(`Lỗi fetch quỹ ${fundCode}:`, e);
        return {};
    }
}

function injectFundsTable(data, containerSelector = 'body') {
    const container = document.querySelector(containerSelector);
    if (!container) return console.error("Không tìm thấy vị trí chèn bảng!");
function sortFunds(arr, query, order) {
    return [...arr].sort((a, b) => {
        if (order === 0) {
            return b[query] - a[query];
        } else {
            return a[query] - b[query];
        }
    });
}
const icon = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.67267 0.283473C3.86056 0.120759 4.13944 0.120759 4.32733 0.283473L6.45032 2.12204C6.80027 2.4251 6.58593 3 6.12299 3H1.87701C1.41407 3 1.19973 2.4251 1.54968 2.12204L3.67267 0.283473Z" fill="#999999"></path><path d="M4.32733 7.71653C4.13944 7.87924 3.86056 7.87924 3.67267 7.71653L1.54968 5.87796C1.19973 5.5749 1.41407 5 1.87701 5L6.12299 5C6.58593 5 6.80027 5.5749 6.45032 5.87796L4.32733 7.71653Z" fill="#4D4D4D"></path></svg>`;
const tdtext = (d, en, e) => {
	if (en !== e){
	return d[en]??"-";
	}
	return `<strong>${d[en]??"-"}</strong>`;

}
    const tableHtml = (d, e, s)=>{ return `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <td rowspan="1">#</td>
                        <td rowspan="1" class="fund-code">Mã CCQ</td>
                        <td rowspan="1" class="fund-name">Tên đầy đủ</td>
                        <td colspan="1" data-ascending="${e=='ytd_nav_change'?s:0}" style="cursor:pointer" data-sort = "ytd_nav_change" class="fund-ytd sort-col">%YTD ${e=='ytd_nav_change'?icon:''}</td>
                        <td rowspan="1" data-ascending="${e=='pe'?s:0}" style="cursor:pointer" data-sort = "pe" class="fund-pe sort-col">PE ${e=='pe'?icon:""}</td>
                        <td rowspan="1" data-ascending="${e=='pb'?s:0}" style="cursor:pointer" data-sort = "pb" class="fund-pb sort-col">PB ${e=='pb'?icon:""}</td>
                        <td rowspan="1" data-ascending="${e=='roe'?s:0}" style="cursor:pointer" data-sort = "roe" class="fund-roe sort-col">ROE ${e=='roe'?icon:""}</td>
                        <td rowspan="1" data-ascending="${e=='beta'?s:0}" style="cursor:pointer" data-sort = "beta" class="fund-beta sort-col">Beta ${e=='beta'?icon:""}</td>
                        <td rowspan="1" data-ascending="${e=='sharpe'?s:0}" style="cursor:pointer" data-sort = "sharpe" class="fund-sharpe sort-col">Sharpe ${e=='sharpe'?icon:""}</td>
                        <td rowspan="1" data-ascending="${e=='std'?s:0}" style="cursor:pointer" data-sort = "std" class="fund-STD sort-col">Độ lệch chuẩn ${e=='std'?icon:""}</td>
                    </tr>
                </thead>
                <tbody>
                    ${d.map((fund, index) => `
                        <tr>
                            <td class="fund-stt">${index + 1}</td>
                            <td class="fund-code" style="text-align: left;">
                                <a href="/quy-dau-tu/${fund.fund_code}" target=_blank class="d-flex align-items-center" style="text-decoration: none; color: inherit;">
                                    <div class="d-flex flex-wrap">
                                        <p class="mb-0 w-100"><strong>${fund.fund_code}</strong></p>
                                    </div>
                                </a>
                            </td>
                            <td class="fund-name">${fund.fund_name}</td>
                            <td class="fund-ytd">${tdtext(fund,"ytd_nav_change",e)}%</td>
                            <td class="fund-pe">${tdtext(fund,"pe",e)}x</td>
                            <td class="fund-pb">${tdtext(fund,"pb",e)}x</td>
                            <td class="fund-roe">${tdtext(fund,"roe",e)}%</td>
                            <td class="fund-beta">${tdtext(fund,"beta",e)}</td>
                            <td class="fund-sharpe">${tdtext(fund,"sharpe",e)}</td>
                            <td class="fund-STD">${tdtext(fund,"std",e)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
	document.addEventListener("click", function(e) {
                const n = e.target.closest("td.sort-col");
                if (n) {
                    const e = n.getAttribute("data-sort") ?? "sharpe"
                      , s = parseInt(n.getAttribute("data-ascending") ?? 0);
			const sortA = sortFunds(data,e, s);
		    	container.innerHTML = tableHtml(sortA, e,s?0:1);
			console.log("Đã sắp xếp theo "+ e);
                }
            });

	container.innerHTML = tableHtml(sortFunds(data,"sharpe", 0), "sharpe", 1);
}


