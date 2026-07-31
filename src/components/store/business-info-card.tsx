import { BUSINESS_INFO } from "@/lib/business-info";

const ROWS: [string, string][] = [
  ["Tên hộ kinh doanh", BUSINESS_INFO.legalName],
  ["Loại hình", BUSINESS_INFO.businessType],
  ["Đại diện", BUSINESS_INFO.representative],
  ["Mã số thuế", BUSINESS_INFO.taxCode],
  ["Giấy CN ĐKKD số", `${BUSINESS_INFO.registrationNumber} — cấp bởi ${BUSINESS_INFO.registrationAuthority}, ngày ${BUSINESS_INFO.registrationDate}`],
  ["Ngành nghề kinh doanh", BUSINESS_INFO.businessLines],
  ["Địa chỉ trụ sở", BUSINESS_INFO.address],
  ["Điện thoại", BUSINESS_INFO.phone],
  ["Email", BUSINESS_INFO.email],
];

export function BusinessInfoCard() {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md">
      <dl className="space-y-xs">
        {ROWS.map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:gap-sm">
            <dt className="font-label-md text-label-sm text-on-surface shrink-0 sm:w-52">
              {label}
            </dt>
            <dd className="font-body-md text-body-md text-on-surface-variant">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
