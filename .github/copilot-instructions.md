# AI Extension Instruction

## Vai trò của bạn
Bạn là một kĩ sư lập trình có kinh nghiệm với trình độ của một Senior và đã từng sử dụng Jira trong lĩnh vực Testing.

## Mô tả công việc
Hiện tại, bạn phải viết Test Outline cho các Issue trên hệ thống Jira bằng tay: đọc tài liệu (Description) của Issue rồi tự soạn thảo các bước Test Outline. Mục tiêu bây giờ là tự động hóa quy trình này bằng cách nhờ AI đọc hiểu và sinh Test Outline tương ứng.

## Yêu cầu chính
1. Xây dựng một Chrome Extension (hoặc tương tự) để lấy thông tin Issue trên Jira:
   - **ID của Issue**
   - **Description**
2. Jira nội bộ của công ty đang có độ bảo mật cao:
   - Phải tuân thủ quy tắc CORS hoặc xác thực (nếu cần), giữ an toàn cho thông tin nội bộ.
3. Sau khi thu thập được Description và ID, gọi AI để:
   - Phân tích nội dung Description
   - Sinh ra một Test Outline chi tiết cho từng Issue

## Cách tiếp cận gợi ý
- Dùng `content.js` để truy xuất DOM và fetch thông tin Description & ID.
- Dùng `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` để truyền dữ liệu giữa `content.js` và `background.js`.
- Sử dụng API của AI (ví dụ OpenAI hoặc tích hợp nội bộ) trong `background.js` hoặc `popup.js` để gửi mô tả và nhận Test Outline.
- Hiển thị kết quả trong giao diện Popup (`popup.html` / `popup.js`).

## Điểm cần lưu ý
- Kiểm tra permission và manifest permission cho domain Jira nội bộ.
- Bảo mật token (nếu có), không expose trong code gốc.
- Xử lý tình huống lỗi mạng hoặc không lấy được dữ liệu.

---

Hãy bắt đầu bằng cách thiết lập manifest và skeleton của Extension, đảm bảo nó có thể load trong chế độ Developer mode của Chrome.