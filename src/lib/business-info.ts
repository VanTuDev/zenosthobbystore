/**
 * Legal identity of the business operating this store, shown in policy pages
 * and the footer per Nghị định 52/2013/NĐ-CP (sửa đổi bởi NĐ 85/2021) on
 * disclosure of trader information for e-commerce websites. Demo data — this
 * project has no real business registration behind it.
 */
export const BUSINESS_INFO = {
  legalName: "Zenost Hobby Store",
  tradeName: "Zenost Hobby Store",
  representative: "Phùng Huy Cường",
  businessType: "Cá nhân kinh doanh",
  taxCode: "************",
  registrationNumber: "*********",
  registrationAuthority: "Đà Nẵng",
  registrationDate: "**/**/****",
  businessLines: "Quảng cáo đồ chơi",
  address: "Đà Nẵng",
  email: "Đang cập nhật",
  phone: "Đang cập nhật",
  workingHours: "8:00 – 21:00, Thứ 2 – Chủ Nhật",
} as const;

/**
 * Social/marketplace profile links shown as quick-contact icons in the header.
 * Placeholder "#" URLs — swap in the real profile links when available.
 */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/zenosthobbystore",
  tiktok: "#",
  shopee: "#",
} as const;

/** Icon-only wordmark, transparent background — used wherever the logo renders on its own (header, footer). */
export const ZENOS_MARK_SVG = "/Logo/zenost-mark.svg";

/** Circular badge version (mark + dark backdrop) — used for the browser tab icon and anywhere a self-contained round badge fits better (e.g. the login modal). */
export const ZENOS_FAVICON_SVG = "/Logo/zenost-favicon.svg";
