// Gửi dữ liệu từ web sang extension
window.addEventListener("message", async (event) => {
  if (event.data.type === "FROM_PAGE_SAVE") {
    chrome.runtime.sendMessage(
      { type: "SAVE_CACHE", key: "bigData", value: event.data.payload },
      (res) => console.log("Saved:", res)
    );
  }

  if (event.data.type === "FROM_PAGE_GET") {
    chrome.runtime.sendMessage({ type: "GET_CACHE", key: "bigData" }, (res) => {
      window.postMessage({ type: "FROM_EXTENSION", payload: res.data }, "*");
    });
  }
});
console.log("Listen Cache")