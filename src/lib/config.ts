const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL chưa được cấu hình — thêm biến này vào .env.local khi chạy dev (vd: http://localhost:4000), " +
      "hoặc vào cấu hình Environment Variables của nền tảng deploy (vd: https://api.zenoshobbystore.vn) khi build production.",
  );
}

try {
  new URL(apiBaseUrl);
} catch {
  throw new Error(
    `NEXT_PUBLIC_API_BASE_URL="${apiBaseUrl}" không phải một URL hợp lệ — cần đầy đủ dạng ` +
      `"https://ten-mien-backend.com" (có "://" và tên miền), không chỉ "https" hay tên miền suông.`,
  );
}

export const API_BASE_URL = apiBaseUrl;
