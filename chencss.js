(async () => {
    try {
        var a = await fetch("https://raw.githubusercontent.com/drphe/data/main/morecss.json");
        var moreCode = await a.json();
        if (moreCode) {
            const currentURL = window.location.href;
            var needInclude = moreCode.find(item => currentURL.includes(item.url));
            if (needInclude) {
                if (needInclude.css) {
                    var style = document.createElement('style');
                    style.textContent = needInclude.css;
                    document.head.appendChild(style);
                }
            }else {
            console.log("Không có Css mở rộng")
            }
        } else {
            console.log("Không tải được css mở rộng!")
        }
    } catch (e) {
        console.log(e)
    }
})()