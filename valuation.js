// Định nghĩa theme
function applyHighchartsTheme(isDark) {
    Highcharts.setOptions({
        chart: {
            backgroundColor: isDark ? '#272d34' : '#ffffff'
        },
        title: {
            style: {
                color: isDark ? '#d1d4dc' : '#000000'
            }
        },
        subtitle: {
            style: {
                color: isDark ? '#d1d4dc' : '#000000'
            }
        },
        xAxis: {
            labels: {
                style: {
                    color: isDark ? '#d1d4dc' : '#000000'
                }
            },
            title: {
                style: {
                    color: isDark ? '#d1d4dc' : '#000000'
                }
            }
        },
        yAxis: {
            labels: {
                style: {
                    color: isDark ? '#d1d4dc' : '#000000'
                }
            },
            title: {
                style: {
                    color: isDark ? '#d1d4dc' : '#000000'
                }
            }
        },
        legend: {
            itemStyle: {
                color: isDark ? '#d1d4dc' : '#000000'
            }
        }
    });
}
const params = new URLSearchParams(window.location.search);
const theme = params.get("theme");
let isDarkTheme = 0;
if (theme === "dark") {
    isDarkTheme = true
    document.documentElement.setAttribute("theme", "dark");
}
else {
    document.documentElement.removeAttribute("theme");
}
applyHighchartsTheme(isDarkTheme);

Highcharts.setOptions({
   tooltip: {
        backgroundColor:isDarkTheme? '#333333':'#fff', // nền tối
        style: {
            color: isDarkTheme?'#ffffff':'#1c2127'       // chữ trắng
        }
    },
    yAxis: {
        gridLineColor: isDarkTheme?'#2f353d': '#efefef', // màu đường kẻ ngang
        gridLineWidth: 0.5 // độ mỏng, có thể đặt 0.5 hoặc 1
    },
    navigation: {
        buttonOptions: {
            symbolStroke: '#ffffff', // màu icon (mặc định là đen)
            symbolFill: '#2f353d', // màu nền của icon
            theme: {
                fill: '#2f353d', // màu nền nút
                stroke: '#444', // viền nút
                style: {
                    color: '#ffffff' // màu chữ
                },
                states: {
                    hover: {
                        fill: isDarkTheme?'#3a4149':'green', // màu khi hover
                        style: {
                            color: '#ffffff'
                        }
                    },
                    select: {
                        fill: '#555', // màu khi chọn
                        style: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        }
    }
});

function convertDateFormat(dateStr) {
    const [month, day, year] = dateStr.split('/');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

function drawchart(data, type, id) {
    // Chuẩn bị dữ liệu cho biểu đồ
    const vnindexData = data.map(item => [new Date(item.Date).getTime(), item.VNINDEX]);
    let PlusRangeData, MinusRangeData;
    if (type == "PB") {
        PlusRangeData = data.map(item => [new Date(item.Date).getTime(), item.PBplus1std, item.PBplus2std]);
        MinusRangeData = data.map(item => [new Date(item.Date).getTime(), item.PBminus2std, item.PBminus1std]);
    }
    else {
        PlusRangeData = data.map(item => [new Date(item.Date).getTime(), item.PEplus1std, item.PEplus2std]);
        MinusRangeData = data.map(item => [new Date(item.Date).getTime(), item.PEminus2std, item.PEminus1std]);
    }
    // Tạo biểu đồ Highcharts
    Highcharts.chart(id, {
        chart: {
            zoomType: 'x' // Cho phép zoom trục X
        },
        title: {
            text: ' VNINDEX và định giá ' + type
        },
        subtitle: {
            text: 'Updated: ' + convertDateFormat(data[data.length - 1].Date),
            align: 'center', // Căn giữa
            style: {
                fontSize: '12px', // Kích thước chữ
                color: '#666666' // Màu chữ (xám nhạt)
            }
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: ''
            },
            crosshair: {
                enabled: true, // Bật crosshair
                color: '#666666', // Màu của đường kẻ dọc (xám nhạt, bạn có thể đổi)
                width: 1, // Độ dày của đường kẻ
                dashStyle: 'Solid' // Kiểu đường (Solid, Dash, Dot, v.v.)
            }
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        legend: {
            enabled: true
        },
        // Ẩn credit
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true,
            followPointer: false, // ko cho theo chuột
            outside: false,
            positioner: function(labelWidth, labelHeight) {
                const chart = this.chart;
                return {
                    x: chart.plotLeft ,
                    y: chart.plotTop
                };
            },
            valueDecimals: 2, // Hiển thị 2 chữ số thập phân cho giá trị
            formatter: function() {
                const date = Highcharts.dateFormat('%d/%m/%Y', this.x);
                let s = `<b>${date}</b><br/>`;
                this.points.forEach(point => {
                    if (point.series.type === 'spline') {
                        s += `${point.series.name}: ${point.y.toFixed(2)}<br/>`;
                    }
                    else if (point.series.type === 'arearange') {
                        s += `${point.series.name}: ${point.low.toFixed(0)} - ${point.high.toFixed(0)}<br/>`;
                    }
                });
                return s;
            }
        },
        plotOptions: {
            arearange: {
                fillOpacity: 0.3,
                lineWidth: 1,
                marker: {
                    enabled: false
                }
            },
            line: {
                lineWidth: 1,
                marker: {
                    enabled: true
                }
            }
        },
        series: [{
            type: 'spline',
            name: 'VNINDEX',
            data: vnindexData,
            color: isDarkTheme ? 'grey' : 'blue' // Màu đen cho VNINDEX
        }, {
            type: 'arearange',
            name: 'Vùng đắt',
            data: PlusRangeData,
            color: '#FF0000', // Màu đỏ cho dải PBplus
            fillOpacity: 0.3
        }, {
            type: 'arearange',
            name: 'Vùng rẻ',
            data: MinusRangeData,
            color: '#00FF00', // Màu xanh lá cho dải PBminus
            fillOpacity: 0.3
        }]
    });
}

function formatCustomDate(isoString) {
    const date = new Date(isoString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Tháng bắt đầu từ 0
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
}
async function fetchChartAndIndicatorData() {
    const toDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const vnindexURL = `https://lite-api.fiintrade.vn/technical/TradingView/GetStockChartData?Code=VNINDEX&DerivativeCode=&Frequency=Daily&From=2012-01-01T00%3A00%3A00.000Z&To=${toDate}T00%3A00%3A00.000Z&Type=Index`;
    const peURL = `https://lite-api.fiintrade.vn/technical/TradingView/GetIndicators?OrganCode=VNINDEX&Code=PE&Frequency=Daily&From=2012-01-01T00%3A00%3A00.000Z&To=${toDate}T00%3A00%3A00.000Z&Type=Index`;
    const pbURL = `https://lite-api.fiintrade.vn/technical/TradingView/GetIndicators?OrganCode=VNINDEX&Code=PB&Frequency=Daily&From=2012-01-01T00%3A00%3A00.000Z&To=${toDate}T00%3A00%3A00.000Z&Type=Index`;
    try {
        const [vnindexRes, peRes, pbRes] = await Promise.all([
            fetch(vnindexURL),
            fetch(peURL),
            fetch(pbURL),
        ]);
        if (!vnindexRes.ok || !peRes.ok || !pbRes.ok) {
            throw new Error('Không thể lấy dữ liệu từ một hoặc cả ba API');
        }
        const [Vnindex, PE, PB] = await Promise.all([
            vnindexRes.json(),
            peRes.json(),
            pbRes.json(),
        ]);
        // tính toán
        // sửa ngày vnindẽ
        const VNINDEX = Vnindex.data.map(item => {
            const originalDate = new Date(item.tradingDate);
            originalDate.setUTCDate(originalDate.getUTCDate() + 1); // dịch sang ngày kế tiếp
            return {
                ...item,
                tradingDate: originalDate.toISOString()
            };
        });

        function mergeVnindexPEPB(vni, pe, pb) {
            // Tạo bản đồ tra cứu cho PE và PB theo ngày
            const mapPE = pe.reduce((acc, item) => {
                const date = new Date(item.tradingDate).toISOString().split('T')[0];
                acc[date] = item.value;
                return acc;
            }, {});
            const mapPB = pb.reduce((acc, item) => {
                const date = new Date(item.tradingDate).toISOString().split('T')[0];
                acc[date] = item.value;
                return acc;
            }, {});
            // Gộp dữ liệu từ vnindex
            const jsondata = vni.map(item => {
                const date = new Date(item.tradingDate).toISOString().split('T')[0];
                return {
                    Date: formatCustomDate(date),
                    VNINDEX: item.closePrice,
                    PE: mapPE[date] ?? null,
                    PB: mapPB[date] ?? null
                };
            });
            return jsondata;
        }
        var jsonData = mergeVnindexPEPB(VNINDEX, PE.data, PB.data);
        // tính trung bình
        var peCal = calculateStats(jsonData.map(d => d.PE))
        var pbCal = calculateStats(jsonData.map(d => d.PB))
        for (var i = 0; i < jsonData.length; i++) {
            jsonData[i].PEplus1std = peCal.meanPlusStd / jsonData[i].PE * jsonData[i].VNINDEX
            jsonData[i].PEplus2std = peCal.meanPlus2Std / jsonData[i].PE * jsonData[i].VNINDEX
            jsonData[i].PEminus1std = peCal.meanMinusStd / jsonData[i].PE * jsonData[i].VNINDEX
            jsonData[i].PEminus2std = peCal.meanMinus2Std / jsonData[i].PE * jsonData[i].VNINDEX
            jsonData[i].PBplus1std = pbCal.meanPlusStd / jsonData[i].PB * jsonData[i].VNINDEX
            jsonData[i].PBplus2std = pbCal.meanPlus2Std / jsonData[i].PB * jsonData[i].VNINDEX
            jsonData[i].PBminus1std = pbCal.meanMinusStd / jsonData[i].PB * jsonData[i].VNINDEX
            jsonData[i].PBminus2std = pbCal.meanMinus2Std / jsonData[i].PB * jsonData[i].VNINDEX
        }
        console.log('Data:', jsonData);
        drawchart(jsonData, "P/E", "container")
        drawchart(jsonData, "P/B", "container2")
    }
    catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}
fetchChartAndIndicatorData();
// hàm tính mean và STD
function calculateStats(arr) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    return {
        mean: mean,
        meanPlusStd: mean + stdDev,
        meanMinusStd: mean - stdDev,
        meanPlus2Std: mean + 2 * stdDev,
        meanMinus2Std: mean - 2 * stdDev
    };
}
