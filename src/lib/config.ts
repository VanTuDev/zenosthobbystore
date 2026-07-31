const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL chưa được cấu hình — thêm biến này vào .env.local (vd: http://localhost:4000).",
  );
}

export const API_BASE_URL = apiBaseUrl;
