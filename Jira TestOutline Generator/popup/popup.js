// Hàm để lấy tất cả các thẻ h1 từ trang web
function getAllH1Content() {
  // Hàm để lấy task ID từ URL Jira (định nghĩa trong scope của function)
  function getTaskIdFromUrl(url) {
    // Tìm pattern JIRA-123, ABC-456, v.v. trong URL
    const match = url.match(/[A-Z]+-\d+/);
    return match ? match[0] : null;
  }

  const h1Elements = document.querySelectorAll('h1');
  const titles = Array.from(h1Elements).map((element, index) => ({
    index: index + 1,
    text: element.innerText.trim()
  })).filter(title => title.text !== ''); // Lọc bỏ các thẻ h1 rỗng

  // Lấy URL của trang
  const pageUrl = document.location.href;
  const pageTitle = document.title;

  // Lấy task ID từ URL
  const taskId = getTaskIdFromUrl(pageUrl);

  return {
    url: pageUrl,
    pageTitle: pageTitle,
    taskId: taskId,
    titles: titles
  };
}

// Hàm để tạo và tải file txt
async function downloadTitles(data) {
  // Tạo tên file dựa trên task ID hoặc ngày tháng
  let filename;
  if (data.taskId) {
    filename = `${data.taskId}.txt`;
  } else {
    const currentDate = new Date().toISOString().slice(0, 10);
    filename = `h1_titles_${currentDate}.txt`;
  }
  
  // Tạo tên thư mục cố định
  const folderName = 'JiraTestOutlines';
  const fullPath = `${folderName}/${filename}`;
  
  // Tạo nội dung file
  let fileContent = `URL: ${data.url}\n`;
  fileContent += `Tiêu đề trang: ${data.pageTitle}\n`;
  if (data.taskId) {
    fileContent += `Task ID: ${data.taskId}\n`;
  }
  fileContent += `Ngày tạo: ${new Date().toLocaleString('vi-VN')}\n`;
  fileContent += `\nDanh sách các thẻ H1 (${data.titles.length}):\n`;
  data.titles.forEach(title => {
    fileContent += `${title.index}. ${title.text}\n`;
  });

  // Tạo blob và tải xuống
  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  try {
    await chrome.downloads.download({
      url: url,
      filename: fullPath,
      saveAs: false  // Tự động lưu vào thư mục Downloads/JiraTestOutlines
    });
    console.log(`File saved: ${fullPath}`);
    return { success: true, filename: filename, path: fullPath };
  } catch (error) {
    console.error('Download error:', error);
    try {
      // Fallback: lưu với saveAs = true nếu có lỗi
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
      console.log(`File saved with saveAs: ${filename}`);
      return { success: true, filename: filename, path: filename };
    } catch (fallbackError) {
      console.error('Fallback download error:', fallbackError);
      throw new Error(`Không thể lưu file: ${fallbackError.message}`);
    }
  }

  // Giải phóng URL
  URL.revokeObjectURL(url);
}

// Log khi popup được load
console.log("Popup loaded");

// Lắng nghe sự kiện khi người dùng nhấn nút "Tạo Test Outline"
document.getElementById("generate").addEventListener("click", async () => {
  console.log("Generate button clicked");
  
  // Hiển thị trạng thái đang tải
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "Đang tải dữ liệu...";

  try {
    // Lấy tab hiện tại
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error("Không thể truy cập trang web này.");
    }

    // Thực thi script để lấy nội dung
    console.log("Executing script on tab:", tab.id);
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getAllH1Content
    });

    console.log("Script execution results:", results);

    // Kiểm tra kết quả trả về
    if (!results || !results[0] || !results[0].result) {
      throw new Error("Không thể lấy dữ liệu từ trang web.");
    }

    // Xử lý kết quả
    const content = results[0].result;
    console.log("Content retrieved:", content);

    if (content && content.titles.length > 0) {
      // Hiển thị kết quả trên popup
      let output = `URL: ${content.url}\n\n`;
      output += `Tiêu đề trang: ${content.pageTitle}\n`;
      if (content.taskId) {
        output += `Task ID: ${content.taskId}\n`;
      }
      output += `\nDanh sách các thẻ H1 (${content.titles.length}):\n`;
      content.titles.forEach(title => {
        output += `${title.index}. ${title.text}\n`;
      });
      
      outputDiv.innerText = output;

      // Tạo và tải file txt
      try {
        const downloadResult = await downloadTitles(content);
        
        // Thông báo đã lưu file thành công
        const successMsg = content.taskId 
          ? `\n✅ Đã lưu file: ${content.taskId}.txt vào thư mục JiraTestOutlines`
          : `\n✅ Đã lưu file vào thư mục JiraTestOutlines`;
        outputDiv.innerText += successMsg;
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        outputDiv.innerText += `\n❌ Lỗi khi lưu file: ${downloadError.message}`;
      }
    } else {
      outputDiv.innerText = "Không tìm thấy thẻ H1 nào trên trang.";
    }

  } catch (error) {
    console.error("Error:", error);
    outputDiv.innerText = `Lỗi: ${error.message}`;
  }
});
