chrome.runtime.sendMessage({
    type: "getISP"
}, (response) => {
    const isp = response.isp.isp;
    if (!isp) return;
    const newDiv = document.createElement("div");
    newDiv.setAttribute("style", "display: flex;justify-content: center;color:black;margin: -0.5rem;font-family: sans-serif;font-weight: 600;cursor: pointer;");
    newDiv.textContent = isp;
    let desISP = isp == "VNPT" ? 45201 : 45202;
    let isChange = false;
    newDiv.addEventListener("click", () => {
        const url = "http://192.168.0.1:8443/goform/goform_set_cmd_process?goformId=setDeviceConfig&configOption=setFirstMnc&configValue=" + desISP + "&admin=admin&pwd=admin";
	if(isChange) { 
   		location.reload(true);
		return;
	}
        const agree = confirm(`Thực hiện chuyển sang mạng ${isp=="VNPT"? "Mobifone": "Vinaphone"} không?`);
        if (agree) {
            fetch(url);isChange = true;
            newDiv.textContent = "Nhấn F5 để làm mới trang!";
        }
        else {
            console.log("Người dùng không đồng ý.");
        }
    });
    const logoContainer = document.querySelector(".logo-container");
    if (logoContainer) {
        logoContainer.appendChild(newDiv);
    }
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        newDiv.textContent += " " + connection.effectiveType.toUpperCase();
    }
});
