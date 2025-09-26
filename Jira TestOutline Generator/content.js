// Lấy tiêu đề và nội dung từ trang
const title = document.querySelector("h1") ? document.querySelector("h1").innerText : "Tiêu đề không có";
const content = document.querySelector(".content") ? document.querySelector(".content").innerText : "Nội dung không có";

console.log("Content script loaded");
console.log("Found title:", title);
console.log("Found content:", content);

// Gửi dữ liệu đã lấy được về background hoặc popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  if (request.action === "getContent") {
    console.log("Sending response:", { title, content });
    sendResponse({ title: title, content: content });
  }
  return true; // Keep the message channel open for sendResponse
});
