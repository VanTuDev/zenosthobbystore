"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { ApiRequestError } from "@/lib/api-client";
import { fetchLegacyDistricts, fetchLegacyProvinces, fetchLegacyWards, fetchProvinces, fetchWards } from "@/lib/api/locations";
import { updatePublicShippingDetails, type PublicShippingDetails, type PublicShippingDetailsInput } from "@/lib/api/orders";

type LocationOption = { code: string; fullName: string };
const fieldClass = "w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container-low";

function selectedLocation(code: string, fullName: string): LocationOption | null {
  return code && fullName ? { code, fullName } : null;
}

export function ShippingDetailsForm({ code, initialDetails, locked }: { code: string; initialDetails: PublicShippingDetails; locked: boolean }) {
  const [recipientName, setRecipientName] = useState(initialDetails.recipientName);
  const [phone, setPhone] = useState(initialDetails.phone);
  const [addressDetail, setAddressDetail] = useState(initialDetails.addressDetail);
  const [addressFormat, setAddressFormat] = useState(initialDetails.addressFormat);
  const [province, setProvince] = useState<LocationOption | null>(selectedLocation(initialDetails.provinceCode, initialDetails.provinceName));
  const [district, setDistrict] = useState<LocationOption | null>(selectedLocation(initialDetails.districtCode, initialDetails.districtName));
  const [ward, setWard] = useState<LocationOption | null>(selectedLocation(initialDetails.wardCode, initialDetails.wardName));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLegacy = addressFormat === "legacy_3_level";

  function clearFeedback() { setMessage(null); setError(null); }
  function changeFormat(next: PublicShippingDetailsInput["addressFormat"]) {
    setAddressFormat(next); setProvince(null); setDistrict(null); setWard(null); clearFeedback();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!province || !ward || (isLegacy && !district)) { setError("Vui lòng chọn đầy đủ các cấp địa chỉ."); return; }
    setSaving(true); clearFeedback();
    try {
      const response = await updatePublicShippingDetails(code, {
        recipientName: recipientName.trim(), phone: phone.trim(), addressFormat,
        provinceCode: province.code, districtCode: isLegacy ? (district?.code ?? "") : "",
        wardCode: ward.code, addressDetail: addressDetail.trim(),
      });
      const saved = response.shippingDetails;
      setRecipientName(saved.recipientName); setPhone(saved.phone); setAddressDetail(saved.addressDetail);
      setProvince(selectedLocation(saved.provinceCode, saved.provinceName));
      setDistrict(selectedLocation(saved.districtCode, saved.districtName));
      setWard(selectedLocation(saved.wardCode, saved.wardName));
      setMessage("Đã gửi thông tin nhận hàng cho shop.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Không thể lưu thông tin nhận hàng. Vui lòng thử lại.");
    } finally { setSaving(false); }
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary"><Icon name="local_shipping" className="!text-[21px]" /></span>
        <div><h2 className="font-headline-sm text-lg text-on-surface">Thông tin nhận hàng</h2><p className="mt-1 text-sm leading-5 text-on-surface-variant">Vui lòng nhập chính xác để shop tạo vận đơn SPX. Tên người nhận được điền sẵn theo tên Facebook và bạn có thể sửa lại.</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-on-surface">Tên người nhận<input required maxLength={100} autoComplete="name" disabled={locked || saving} value={recipientName} onChange={(event) => { setRecipientName(event.target.value); clearFeedback(); }} className={fieldClass} /></label>
          <label className="space-y-1.5 text-sm font-medium text-on-surface">Số điện thoại<input required minLength={8} maxLength={20} type="tel" inputMode="tel" autoComplete="tel" disabled={locked || saving} value={phone} onChange={(event) => { setPhone(event.target.value); clearFeedback(); }} placeholder="09xxxxxxxx" className={fieldClass} /></label>
        </div>

        <fieldset disabled={locked || saving} className="space-y-2">
          <legend className="text-sm font-medium text-on-surface">Loại địa chỉ</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${isLegacy ? "border-primary bg-white ring-1 ring-primary" : "border-outline-variant/40 bg-white/60"}`}><input type="radio" name="address-format" checked={isLegacy} onChange={() => changeFormat("legacy_3_level")} className="mt-1 accent-primary" /><span><strong className="block text-sm">Địa chỉ cũ — 3 cấp</strong><span className="text-xs text-on-surface-variant">Tỉnh/Thành · Quận/Huyện · Phường/Xã</span></span></label>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${!isLegacy ? "border-primary bg-white ring-1 ring-primary" : "border-outline-variant/40 bg-white/60"}`}><input type="radio" name="address-format" checked={!isLegacy} onChange={() => changeFormat("new_2_level")} className="mt-1 accent-primary" /><span><strong className="block text-sm">Địa chỉ mới — 2 cấp</strong><span className="text-xs text-on-surface-variant">Tỉnh/Thành · Phường/Xã</span></span></label>
          </div>
        </fieldset>

        <div className={`grid gap-4 ${isLegacy ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
          <label className="space-y-1.5 text-sm font-medium text-on-surface">Tỉnh/Thành phố<SearchCombobox<LocationOption> id="shipping-province" required disabled={locked || saving} placeholder="Chọn Tỉnh/Thành phố" selected={province} getKey={(item) => item.code} getLabel={(item) => item.fullName} onSearch={async (query) => isLegacy ? fetchLegacyProvinces(query) : fetchProvinces(query)} onSelect={(item) => { setProvince(item); setDistrict(null); setWard(null); clearFeedback(); }} /></label>
          {isLegacy && <label className="space-y-1.5 text-sm font-medium text-on-surface">Quận/Huyện<SearchCombobox<LocationOption> id="shipping-district" required disabled={locked || saving || !province} disabledPlaceholder="Chọn Tỉnh/Thành trước" placeholder="Chọn Quận/Huyện" selected={district} getKey={(item) => item.code} getLabel={(item) => item.fullName} onSearch={(query) => province ? fetchLegacyDistricts(province.code, query) : Promise.resolve([])} onSelect={(item) => { setDistrict(item); setWard(null); clearFeedback(); }} /></label>}
          <label className="space-y-1.5 text-sm font-medium text-on-surface">Phường/Xã<SearchCombobox<LocationOption> id="shipping-ward" required disabled={locked || saving || !province || (isLegacy && !district)} disabledPlaceholder={isLegacy ? "Chọn Quận/Huyện trước" : "Chọn Tỉnh/Thành trước"} placeholder="Chọn Phường/Xã" selected={ward} getKey={(item) => item.code} getLabel={(item) => item.fullName} onSearch={(query) => isLegacy ? (district ? fetchLegacyWards(district.code, query) : Promise.resolve([])) : (province ? fetchWards(province.code, query) : Promise.resolve([]))} onSelect={(item) => { setWard(item); clearFeedback(); }} /></label>
        </div>

        <label className="block space-y-1.5 text-sm font-medium text-on-surface">Số nhà, tên đường, thôn/xóm<textarea required minLength={2} maxLength={200} rows={2} autoComplete="street-address" disabled={locked || saving} value={addressDetail} onChange={(event) => { setAddressDetail(event.target.value); clearFeedback(); }} placeholder="Ví dụ: 123 Nguyễn Văn Linh" className={`${fieldClass} resize-y`} /></label>
        {locked ? <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">Đơn hàng đã hoàn tất nên thông tin nhận hàng đã được khóa.</p> : <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60 sm:w-auto"><Icon name={saving ? "progress_activity" : "send"} className={`!text-[18px] ${saving ? "animate-spin" : ""}`} />{saving ? "Đang gửi..." : "Gửi thông tin nhận hàng"}</button>}
        {message && <p role="status" className="text-sm font-medium text-[#15803d]">{message}</p>}
        {error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}
      </form>
    </section>
  );
}
