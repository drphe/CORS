let portfolioData = {
    "Core": [
        { "loai": "CCQ", "ma": "VCBF-FIF", "sl": 3831, "giaMua": 15660, "giaTT": 15769, "isCCQ": true },
        { "loai": "CP", "ma": "HPG", "sl": 460, "giaMua": 22970, "giaTT": 27800, "isCCQ": false }
    ],
    "Satellite": [
        { "loai": "CCQ", "ma": "VCBF-BCF", "sl": 458, "giaMua": 43656, "giaTT": 44814, "isCCQ": true },
        { "loai": "CP", "ma": "SHB", "sl": 0, "giaMua": 13504, "giaTT": 14750, "isCCQ": false }
    ],
    "inputs": {
        "tienMat": 29256931,
        "tongVon": 112000000,
        "ngayCapNhat": "20/02/2024"
    }
};
let listFunds =[];
const formatNum = (n) => n === 0 ? "0" : (n ? Math.round(n).toLocaleString('de-DE') : "-");

async function renderAll() {
    const res = await calculateTotals();
    renderTable(res);
    renderOverall(res);
    updateCharts(res);
    getUpdateDate();

}
let updateDate;
async function calculateTotals() {
  let satT = 0, coreT = 0, ccqV = 0, cpV = 0;

  for (const g of ["Core", "Satellite"]) {
    for (const item of portfolioData[g]) {
      try {
        if (!item.isCCQ) {
          const d = await fetch("https://api.simplize.vn/api/historical/prices/ohlcv?ticker=" + item.ma +  "&size=1&interval=1d&type=stock" );
          const s = await d.json();
          if (s.data && s.data.length > 0) {
            item.giaTT = s.data[0][4]; // giá đóng cửa
	    updateDate = s.data[0][0]; // ngày đóng cửa
          }
        }else {
		const id = Object.entries(listFunds).find(([key, value]) => value === item.ma)?.[0];
		const c = await fetch("https://api.fmarket.vn/res/products/"+id);
		const s = await c.json();
		item.giaTT = s.data.nav;
	}
      } catch (e) {
        console.error("Lỗi lấy giá cho", item.ma);
      }

      const v = item.sl * item.giaTT;
      if (g === "Core") coreT += v;
      else satT += v;
      if (item.isCCQ) ccqV += v;
      else cpV += v;
    }
  }

  chrome.storage.local.set({ portfolio: portfolioData });
  return {satT, coreT, ccqV, cpV, marketV: ccqV + cpV, tienM: portfolioData.inputs.tienMat };
}


function renderTable(res) {
    const tbody = document.getElementById('tableBody');
    let html = "";
    ["Core", "Satellite"].forEach(group => {
        portfolioData[group].forEach((item, idx) => {
            const v = item.sl * item.giaTT;
            html += `<tr data-group="${group}" data-index="${idx}">
                <td class="bold">${idx === 0 ? group : ""}</td>
                <td>${item.loai}</td>
                <td class="highlight edit-field input" data-key="ma">${item.ma}</td>
                <td class="highlight text-right edit-field" data-key="sl">${item.sl}</td>
                <td class="highlight text-right edit-field" data-key="giaMua">${item.giaMua}</td>
                <td class="highlight text-right edit-field" data-key="giaTT">${item.giaTT}</td>
                <td class="text-right">${item.giaMua > 0 ? ((item.giaTT-item.giaMua)/item.giaMua*100).toFixed(2) : 0}%</td>
                <td class="text-right">${formatNum(v)}</td>
                <td style="text-align:center">
			<span class="btn add" data-group="${group}">➕</span>
			<span class="btn edit">✏️</span>
			<span class="btn del" data-group="${group}" data-idx="${idx}">❌</span>
                </td>
            </tr>`;
        });
        html += `<tr class="row-spacer"><td colspan="9"></td></tr>`;
    });
    tbody.innerHTML = html;
    //document.getElementById('groupSummary').innerHTML = `
    //    <tr><td>T.Satellite</td><td class="text-right">${formatNum(res.satT)}</td></tr>
    //    <tr><td>T.Core</td><td class="text-right">${formatNum(res.coreT)}</td></tr>`;
}

function renderOverall(res) {
    const inp = portfolioData.inputs;
    const totalA = res.marketV + res.tienM;
    const perf = (((totalA - inp.tongVon) / inp.tongVon) * 100).toFixed(2);

    document.getElementById('overallSummary').innerHTML = `
        <tr><td>Tiền mặt</td><td class="tienMat text-right highlight" data-field="tienMat">${formatNum(inp.tienMat)}</td></tr>
        <tr><td>CCQ</td><td class="text-right">${formatNum(res.ccqV)}</td></tr>
        <tr><td>Cổ phiếu</td><td class="text-right">${formatNum(res.cpV)}</td></tr>
        <tr><td>Giá trị thị trường</td><td class="text-right">${formatNum(res.marketV)}</td></tr>
        <tr><td colspan="2">&nbsp;</td></tr>
        <tr class="bold"><td>Tổng tài sản</td><td class="text-right">${formatNum(totalA)}</td></tr>
        <tr><td>Tỷ lệ giải ngân</td><td class="text-right bg-navy">${((res.marketV/totalA)*100).toFixed(0)}%</td></tr>
        <tr><td>T.core</td><td class="text-right bg-navy">${((res.coreT/totalA)*100).toFixed(0)}%</td></tr>
        <tr class="bold"><td>Tổng tài sản vốn (${inp.ngayCapNhat})</td><td class="tongVon text-right highlight" data-field="tongVon"> ${formatNum(inp.tongVon)}
</td>
</tr>
        <tr class="bold"><td>Hiệu suất toàn danh mục</td><td class="text-right bg-navy">${perf}%</td></tr>`;
}

function formatToBillion(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' tỷ';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' triệu';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' nghìn';
    } else {
        return num.toString();
    }
}

function updateCharts(res) {
    // Chart 1: Asset Type
    const chart1 = echarts.init(document.getElementById('assetTypeChart'));
    chart1.setOption({
        title: { text: 'Cơ cấu loại tài sản', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item',formatter: function(params) {
            return params.name + ': ' + formatToBillion(params.value);
        } },
        legend: { left: '0', orient: 'vertical' },
        color: ['#1c6180', '#e97c31', '#1d6e2a'],
        series: [{
            type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
            avoidLabelOverlap: false,
            label: { show: true, formatter: '{d}%' },
            data: [
                { value: res.tienM, name: 'Tiền mặt' },
                { value: res.ccqV, name: 'CCQ' },
                { value: res.cpV, name: 'Cổ phiếu' }
            ]
        }]
    });

    // Chart 2: Core-Satellite
    const chart2 = echarts.init(document.getElementById('coreSatelliteChart'));
    chart2.setOption({
        title: { text: 'Cơ cấu Core-Satellite', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item',formatter: function(params) {
            return params.name + ': ' + formatToBillion(params.value) + ' (' + params.percent.toFixed(2) + '%)';
        } },
        legend: { bottom: '0', orient: 'horizontal' },
	color: ['#4CAF50', '#FF9800'],

        series: [{
            type: 'pie', radius: '70%', center: ['50%', '45%'],
            label: { show: true, formatter: '{d}%' },
            data: [
                { value: res.satT+res.tienM, name: 'T.Satellite' },
                { value: res.coreT, name: 'T.Core' }
            ]
        }]
    });

    let dataCCQ = [], dataCP = [];
   portfolioData.Satellite.forEach(s=> {
	s.isCCQ ? dataCCQ.push({name: s.ma, value: s.sl * s.giaTT}): dataCP.push({name: s.ma, value: s.sl * s.giaTT});
   })
   portfolioData.Core.forEach(s=> {
	s.isCCQ ? dataCCQ.push({name: s.ma, value: s.sl * s.giaTT}): dataCP.push({name: s.ma, value: s.sl * s.giaTT});
   })
   dataCP.push({name: "Tiền mặt", value: res.tienM});

    // Chart 3: CCQ
    const chart3 = echarts.init(document.getElementById('ccqChart'));
    chart3.setOption({
        title: { text: 'Danh mục CCQ', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item',formatter: function(params) {
            return params.name + ': ' + formatToBillion(params.value) + ' (' + params.percent.toFixed(2) + '%)';
        } },
        legend: { bottom: '0', orient: 'horizontal' },
	color: ['#1976D2', '#FBC02D', '#388E3C'],
        series: [{
            type: 'pie', radius: '70%', center: ['50%', '45%'],
            label: { show: true, formatter: '{d}%' },
            data: dataCCQ
        }]
    });
    // Chart 4: CP
    const chart4 = echarts.init(document.getElementById('cpChart'));
    chart4.setOption({
        title: { text: 'Danh mục CP', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item',formatter: function(params) {
            return params.name + ': ' + formatToBillion(params.value) + ' (' + params.percent.toFixed(2) + '%)';
        } },
        legend: { bottom: '0', orient: 'horizontal' },
color: ['#1565C0', '#F57C00', '#2E7D32'],

        series: [{
            type: 'pie', radius: '70%', center: ['50%', '45%'],
            label: { show: true, formatter: '{d}%' },
            data: dataCP
        }]
    });
}

// Event Handlers
function addRow(g) {
    const isCCQ = confirm("Mã này là CCQ?");
    portfolioData[g].push({ "loai": isCCQ ? "CCQ" : "CP", "ma": "Code", "sl": 0, "giaMua": 0, "giaTT": 0, "isCCQ": isCCQ });
    renderAll();
}
function deleteRow(g, i) { if(confirm("Xóa?")) { portfolioData[g].splice(i, 1); renderAll(); } }
function editInp(k) {
    const v = prompt("Nhập giá trị mới:", portfolioData.inputs[k]);
    if (v !== null) { portfolioData.inputs[k] = parseFloat(v.replace(/\./g, '')) || 0; renderAll(); }
}
function toggleEdit(btn) {
    const row = btn.closest('tr');
    const fields = row.querySelectorAll('.edit-field');
        row.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveRow();
            }
        };


    if (btn.innerText === "✏️") {
        fields.forEach(f => f.contentEditable = true);
        btn.innerText = "💾";
    } else saveRow();
    function saveRow(){
        const g = row.dataset.group, i = row.dataset.index;
        fields.forEach(f => {
            let val = f.innerText.toUpperCase();
            if (["sl", "giaMua", "giaTT"].includes(f.dataset.key)) val = parseFloat(val.replace(/\./g, '')) || 0;
            portfolioData[g][i][f.dataset.key] = val;
        });
        renderAll();
    }
}
async function fetchListFund() {
    try {
        const res = await fetch("https://api.fmarket.vn/res/products/filter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "types": ["NEW_FUND", "TRADING_FUND"],
                "sortOrder": "DESC",
                "sortField": "navTo12Months",
                "page": 1,
                "pageSize": 100,
                "fundAssetTypes": ["STOCK", "BALANCED", "BOND"]
            })
        });
        const result = await res.json();
        rawData = result.data.rows;
	return rawData.reduce((acc, fund) => {acc[fund.id] = fund.shortName; return acc;}, {});
    }
    catch (err) {
        console.error(err);
    }
}
function getUpdateDate() {
    const d = new Date(updateDate*1000);
    document.querySelector(".date").innerHTML = `(${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()})`;
};

document.addEventListener("DOMContentLoaded", async () => {
listFunds = await fetchListFund();
chrome.storage.local.get(["portfolio"], (result) => {
  if (!result.portfolio) {
    chrome.storage.local.set({ portfolio: portfolioData }, () => {
      renderAll();
    });
  } else {
    portfolioData = result.portfolio;
    renderAll();
  }
  
});

document.querySelectorAll("table").forEach(table => {
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn") && e.target.classList.contains("add")) {
      const group = e.target.getAttribute("data-group");
      addRow(group);
    }

    if ((e.target.classList.contains("btn") && e.target.classList.contains("edit"))) {
      toggleEdit(e.target);
    }

    if (e.target.classList.contains("btn") && e.target.classList.contains("del")) {
      const group = e.target.getAttribute("data-group");
      const idx = e.target.getAttribute("data-idx");
      deleteRow(group, idx);
    }

    if (e.target.classList.contains("tongVon")) {
      editInp(e.target.getAttribute("data-field"));
    }

    if (e.target.classList.contains("tienMat")) {
      editInp(e.target.getAttribute("data-field"));
    }
  });
});
});


