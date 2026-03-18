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
        if (cells.length < 2 || !cells[1].querySelector('span')) return null;

        if (cells.length < 7) return null;

        return {
            symbol: cells[1].querySelector('span').innerText.trim(),
            quantity: parseFinanceValue(cells[2].innerText),
            changeAmount: parseFinanceValue(cells[3].innerText),
            changePercent: cells[4].innerText.trim(), // Giữ string vì có thể là "mua mới" hoặc "thoái vốn"
            currentValue: parseFinanceValue(cells[5].innerText), // Tỷ đồng
            ratio: parseFinanceValue(cells[6].innerText) // % GAV
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
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu mã ${ticker}:`, error);
        return [];
    }
}

async function calculateTotalPortfolioChange(portfolio) {
    // 1. Tạo danh sách các Promises lấy dữ liệu cho tất cả các mã
    const fetchPromises = portfolio.map(item => 
        getStockHistory(item.symbol).then(history => ({
            symbol: item.symbol,
            quantity: item.quantity,
            ratio: item.ratio,
            history: history
        }))
    );

    // 2. Chờ tất cả API trả về kết quả cùng lúc (nhanh hơn chạy từng cái)
    const results = await Promise.all(fetchPromises);

    // 3. Tính toán tổng giá trị biến động
    let allChange = 0;

    results.forEach(res => {
        // Kiểm tra xem có dữ liệu lịch sử không và lấy phần tử cuối cùng (mới nhất)
        if (res.history && res.history.length > 0) {
            const latestData = res.history[res.history.length - 1];
            allChange += res.quantity * latestData.change;
            const portfolioItem = portfolio.find(item => item.symbol === res.symbol);
            if (portfolioItem) {
                portfolioItem.change = latestData.change;
                portfolioItem.changeP = latestData.percent;
            }
        }
    });

    return Number(allChange.toFixed(0)); 
}
function formatNumber(n) {
  // Nếu được truyền vào chuỗi số (ví dụ "-12345"), chuyển về kiểu số
  const num = typeof n === 'string' ? Number(n.replace(/,/g, '').trim()) : n;
  if (typeof num !== 'number' || Number.isNaN(num)) return String(n);

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    return sign + (abs / 1_000_000_000).toFixed(3) + " tỷ";
  } else if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(3) + " triệu";
  } else if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(3) + " nghìn";
  } else {
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
    if(portfolio.length === 0) { 
        console.log("Danh mục trống hoặc không lấy được dữ liệu!");   
        return;
    }
    const totalChangeNAV = await calculateTotalPortfolioChange(portfolio);
    console.table(portfolio); // Hiển thị dạng bảng danh mục trong console cho dễ nhìn
    console.log(`Biến động toàn danh mục hôm nay: ${formatNumber(totalChangeNAV)}`);

    // Lấy phần tử chứa NAV
const navElement = document.querySelector('.nav.flex-between .value');
const navValue = navElement ? navElement.textContent.trim() : null;
    if(navValue) {
        const currentNAV = parseNAV(navValue);
        console.log(`NAV hiện tại: ${formatNumber(currentNAV)}`);
        const content = `Dự kiến NAV%: ${((totalChangeNAV / (currentNAV)) * 100).toFixed(3)} %`;
        console.log(content); 
        // Lấy tất cả các div con bên trong .portfolio-metrics
        const items = document.querySelectorAll('.portfolio-metrics > div>div');

        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          const parent = lastItem.parentNode;

          // Cấu hình cho hai clone mới
          const configs = [
            { label: "\u0394NAV", value: formatNumber(totalChangeNAV) },
            { label: "\u0394NAV%", value: ((totalChangeNAV / currentNAV) * 100).toFixed(3) + " %" }
          ];

          configs.forEach(config => {
            const clone = lastItem.cloneNode(true);
            const label = clone.querySelector('.metric-label');
            if (label) label.textContent = config.label;
            const value = clone.querySelector('.metric-value');
            if (value) {
              value.textContent = config.value;
              value.style.color = config.value.startsWith('-') ? 'red' : 'green'; // Màu đỏ nếu âm, xanh nếu dương
            }
            parent.appendChild(clone);
            clone.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }

    } else {
        console.error("Không tìm thấy phần tử NAV!");
        return;
    }
})();
