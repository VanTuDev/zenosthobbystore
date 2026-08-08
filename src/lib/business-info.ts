/**
 * Legal identity of the business operating this store, shown in policy pages
 * and the footer per Nghị định 52/2013/NĐ-CP (sửa đổi bởi NĐ 85/2021) on
 * disclosure of trader information for e-commerce websites. Demo data — this
 * project has no real business registration behind it.
 */
export const BUSINESS_INFO = {
  legalName: "Hộ kinh doanh ZENOST Hobby Store",
  tradeName: "ZENOST Hobby Store",
  representative: "Nguyễn Văn Zên",
  businessType: "Hộ kinh doanh cá thể",
  taxCode: "0123456789",
  registrationNumber: "41A8012345",
  registrationAuthority: "Phòng Tài chính – Kế hoạch UBND Quận 1, TP. Hồ Chí Minh",
  registrationDate: "12/03/2021",
  businessLines: "Bán lẻ mô hình đồ chơi, quà lưu niệm và phụ kiện hobby (Mã ngành 4764)",
  address: "45 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh, Việt Nam",
  email: "support@zenosthobbystore.com",
  phone: "1900 6868",
  workingHours: "8:00 – 21:00, Thứ 2 – Chủ Nhật",
} as const;

/**
 * Social/marketplace profile links shown as quick-contact icons in the header.
 * Placeholder "#" URLs — swap in the real profile links when available.
 */
export const SOCIAL_LINKS = {
  facebook: "#",
  tiktok: "#",
  shopee: "#",
} as const;

/** Icon-only wordmark, transparent background — used wherever the logo renders on its own (header, footer). */
export const ZENOS_MARK_SVG = "/Logo/zenost-mark.svg";

/** Circular badge version (mark + dark backdrop) — used for the browser tab icon and anywhere a self-contained round badge fits better (e.g. the login modal). */
export const ZENOS_FAVICON_SVG = "/Logo/zenost-favicon.svg";
