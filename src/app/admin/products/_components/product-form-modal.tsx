"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageDropzone, type DraftImage } from "@/components/ui/image-dropzone";
import { HighlightsEditor } from "./highlights-editor";
import { SpecsEditor, type Spec } from "./specs-editor";
import { VideoInputEditor } from "./video-input-editor";
import { VariantsEditor, draftFromVariant, type DraftVariant } from "./variants-editor";
import { CategoryPicker } from "@/components/admin/category-picker";
import { PriceInput } from "./price-input";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import { createProduct, updateProduct } from "@/lib/api/products";
import { deleteProductImage, uploadProductImage } from "@/lib/api/uploads";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiCategory, ApiProduct, ApiProductVideo } from "@/lib/api-types";
import type { StockStatus } from "@/lib/types";

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: "in_stock", label: "Còn hàng" },
  { value: "pre_order", label: "Đặt trước" },
  { value: "coming_soon", label: "Sắp mở bán" },
  { value: "sold_out", label: "Hết hàng" },
];

const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
const labelClass = "block font-label-md text-[12px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1.5";

type TabId = "basic" | "media" | "pricing" | "variants" | "details";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "basic", label: "Cơ bản", icon: "info" },
  { id: "media", label: "Hình ảnh", icon: "image" },
  { id: "pricing", label: "Giá & Kho", icon: "sell" },
  { id: "variants", label: "Biến thể", icon: "style" },
  { id: "details", label: "Chi tiết & Danh mục", icon: "category" },
];

function parseNumber(value: string) {
  const n = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function imagesFromProduct(product?: ApiProduct): DraftImage[] {
  if (!product) return [];
  const urls = product.images.length > 0 ? product.images : product.heroImage ? [product.heroImage] : [];
  return urls
    .filter((url) => url !== "/placeholder-product.svg")
    .map((url, i) => ({ id: `existing-${i}-${url}`, url, name: url, status: "done" as const }));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  /** Present → edit that product; absent → create a new one. */
  product?: ApiProduct;
  categories: ApiCategory[];
  onClose: () => void;
  onSaved: (product: ApiProduct) => void;
}) {
  const isEdit = Boolean(product);

  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [universe, setUniverse] = useState(product?.universe ?? "");
  const [scale, setScale] = useState(product?.scale ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [highlights, setHighlights] = useState<string[]>(product?.highlights ?? []);
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? []);
  const [images, setImages] = useState<DraftImage[]>(() => imagesFromProduct(product));
  const [videos, setVideos] = useState<ApiProductVideo[]>(product?.videos ?? []);
  const [variants, setVariants] = useState<DraftVariant[]>(() => (product?.variants ?? []).map(draftFromVariant));
  const [categoryId, setCategoryId] = useState<string | null>(product?.categoryId ?? null);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ? String(product.originalPrice) : "");
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice ? String(product.sellingPrice) : product?.price ? String(product.price) : "",
  );
  const [promoPrice, setPromoPrice] = useState(product?.promoPrice ? String(product.promoPrice) : "");
  const [costPrice, setCostPrice] = useState(product?.costPrice ? String(product.costPrice) : "");
  const [stockStatus, setStockStatus] = useState<StockStatus>(product?.stockStatus ?? "in_stock");
  const [stockCount, setStockCount] = useState(product?.stockCount ? String(product.stockCount) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const sellingPriceNum = parseNumber(sellingPrice);
  const originalPriceNum = parseNumber(originalPrice);
  const promoPriceNum = parseNumber(promoPrice);
  const costPriceNum = parseNumber(costPrice);

  const displayPrice = promoPriceNum ?? sellingPriceNum;
  const displayCompareAt =
    promoPriceNum && sellingPriceNum && sellingPriceNum > promoPriceNum
      ? sellingPriceNum
      : originalPriceNum && sellingPriceNum && originalPriceNum > sellingPriceNum
        ? originalPriceNum
        : undefined;

  const margin =
    displayPrice && costPriceNum ? Math.round(((displayPrice - costPriceNum) / displayPrice) * 100) : undefined;

  const isUploadingImages = images.some((img) => img.status === "uploading");
  const hasNoCatalogData = categories.length === 0;
  const slugPreview = useMemo(() => slugify(name) || "san-pham-moi", [name]);

  const tabStatus = useMemo<Record<TabId, "ok" | "warn" | "idle">>(
    () => ({
      basic: name.trim() ? "ok" : "warn",
      media: images.length > 0 ? "ok" : "idle",
      pricing: sellingPriceNum ? "ok" : "warn",
      variants: variants.length > 0 ? "ok" : "idle",
      details: categoryId ? "ok" : "idle",
    }),
    [name, images.length, sellingPriceNum, variants.length, categoryId],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setActiveTab("basic");
      return setError("Vui lòng nhập tên sản phẩm.");
    }
    if (!sellingPriceNum) {
      setActiveTab("pricing");
      return setError("Vui lòng nhập giá bán hợp lệ.");
    }
    if (isUploadingImages) {
      setActiveTab("media");
      return setError("Vui lòng đợi ảnh tải lên xong.");
    }

    const readyImages = images.filter((img) => img.status === "done").map((img) => img.url);
    const cleanSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
    const cleanVariants = variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        name: v.name.trim(),
        price: parseNumber(v.price) ?? 0,
        stockCount: parseNumber(v.stockCount) ?? 0,
        image: v.image,
      }));

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || "ZENOS Exclusive",
        universe: universe.trim() || undefined,
        scale: scale.trim() || "Không tỷ lệ",
        price: displayPrice ?? sellingPriceNum,
        compareAtPrice: displayCompareAt ?? null,
        sellingPrice: sellingPriceNum,
        originalPrice: originalPriceNum ?? null,
        promoPrice: promoPriceNum ?? null,
        costPrice: costPriceNum ?? null,
        stockStatus,
        stockCount: parseNumber(stockCount) ?? 0,
        badges: promoPriceNum ? ["limited"] : stockStatus === "pre_order" ? ["pre_order"] : [],
        description: description.trim(),
        highlights,
        specs: cleanSpecs,
        images: readyImages.length > 0 ? readyImages : ["/placeholder-product.svg"],
        heroImage: readyImages[0] ?? "/placeholder-product.svg",
        videos,
        variants: cleanVariants,
        categoryId,
      };

      const { product: saved } = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Lưu sản phẩm thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" aria-hidden="true" />

      {/* Main Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        {/* Mobile Handle Indicator */}
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline-variant/60" />
        </div>

        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon name={isEdit ? "edit" : "add_photo_alternate"} className="!text-[20px]" />
            </span>
            <div className="min-w-0">
              <h2
                id="product-form-modal-title"
                className="font-headline-sm text-base sm:text-lg font-bold text-on-surface leading-tight truncate"
              >
                {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">
                {isEdit ? product?.name : `zenosthobbystore.com/products/${slugPreview}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
          >
            <Icon name="close" className="!text-[20px]" />
          </button>
        </div>

        {/* Tabs Bar (Scrollable) */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 bg-surface-container-lowest border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const status = tabStatus[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 font-label-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  active
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name={tab.icon} className="!text-[18px]" />
                <span>{tab.label}</span>
                {status === "warn" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" aria-label="Còn thiếu thông tin" />
                )}
                {status === "ok" && (
                  <Icon name="check_circle" className="!text-[14px] text-primary" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label htmlFor="p-name" className={labelClass}>
                  Tên sản phẩm <span className="text-error">*</span>
                </label>
                <input
                  id="p-name"
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vd: Nendoroid Zenitsu Agatsuma..."
                  className={`${inputClass} font-semibold`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="p-brand" className={labelClass}>Thương hiệu</label>
                  <input
                    id="p-brand"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Vd: Good Smile Co."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="p-universe" className={labelClass}>Thế giới / IP</label>
                  <input
                    id="p-universe"
                    type="text"
                    value={universe}
                    onChange={(e) => setUniverse(e.target.value)}
                    placeholder="Vd: Demon Slayer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="p-scale" className={labelClass}>Tỉ lệ</label>
                  <input
                    id="p-scale"
                    type="text"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    placeholder="Vd: 1/7, Non-scale..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="p-description" className={labelClass}>Mô tả sản phẩm</label>
                <textarea
                  id="p-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về sản phẩm, chất liệu, xuất xứ..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <p className={labelClass}>Điểm nổi bật (Tối đa 4)</p>
                <HighlightsEditor highlights={highlights} onChange={setHighlights} />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === "media" && (
            <div className="max-w-2xl mx-auto space-y-3">
              <p className={labelClass}>Bộ sưu tập hình ảnh</p>
              <ImageDropzone
                images={images}
                onChange={setImages}
                uploadFn={uploadProductImage}
                deleteFn={deleteProductImage}
                tileClassName="w-28 h-28 sm:w-32 sm:h-32"
                helperLabel="ảnh sản phẩm"
              />
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                💡 <b>Mẹo:</b> Ảnh đầu tiên (gắn nhãn &quot;Bìa&quot;) sẽ hiển thị làm ảnh đại diện sản phẩm ngoài cửa hàng. Di chuột/nhấp vào ảnh để thay đổi thứ tự.
              </p>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className={labelClass}>Video quảng cáo (TikTok / YouTube)</p>
                <VideoInputEditor videos={videos} onChange={setVideos} />
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & STOCK */}
          {activeTab === "pricing" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p-original" className={labelClass}>Giá gốc</label>
                  <PriceInput id="p-original" value={originalPrice} onChange={setOriginalPrice} placeholder="5.200.000" />
                </div>
                <div>
                  <label htmlFor="p-selling" className={labelClass}>
                    Giá bán chính thức <span className="text-error">*</span>
                  </label>
                  <PriceInput id="p-selling" value={sellingPrice} onChange={setSellingPrice} placeholder="4.650.000" />
                </div>
                <div>
                  <label htmlFor="p-promo" className={labelClass}>Giá khuyến mãi (Nếu có)</label>
                  <PriceInput id="p-promo" value={promoPrice} onChange={setPromoPrice} placeholder="Khuyến mãi đặc biệt" />
                </div>
                <div>
                  <label htmlFor="p-cost" className={labelClass}>
                    <span className="inline-flex items-center gap-1 text-tertiary">
                      <Icon name="visibility_off" className="!text-[13px]" />
                      Giá vốn (Nội bộ)
                    </span>
                  </label>
                  <PriceInput id="p-cost" value={costPrice} onChange={setCostPrice} placeholder="Chỉ Admin thấy" tone="muted" />
                </div>
              </div>

              {/* Preview Giá & Margin */}
              {displayPrice && (
                <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-label-md text-xs text-on-surface-variant">Hiển thị cho khách:</span>
                    {displayCompareAt && (
                      <span className="font-body-md text-xs text-on-surface-variant line-through">
                        {formatVnd(displayCompareAt)}
                      </span>
                    )}
                    <span className="font-headline-sm text-sm sm:text-base text-primary font-bold">
                      {formatVnd(displayPrice)}
                    </span>
                  </div>
                  {margin !== undefined && (
                    <span
                      className={`font-label-md text-xs font-semibold px-2 py-0.5 rounded-md ${
                        margin >= 0 ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                      }`}
                    >
                      Lợi nhuận {margin}%
                    </span>
                  )}
                </div>
              )}

              {/* Tình trạng kho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20">
                <div>
                  <label htmlFor="p-stock-status" className={labelClass}>Tình trạng kho hàng</label>
                  <select
                    id="p-stock-status"
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                    className={inputClass}
                  >
                    {STOCK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="p-stock-count" className={labelClass}>Số lượng tồn kho</label>
                  <input
                    id="p-stock-count"
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: VARIANTS */}
          {activeTab === "variants" && (
            <div className="max-w-2xl mx-auto space-y-3">
              <p className={labelClass}>Biến thể sản phẩm (Tối đa 100)</p>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed -mt-2">
                Mỗi biến thể (màu sắc, kích thước...) có giá và tồn kho riêng, độc lập với giá/tồn kho ở tab
                &quot;Giá &amp; Kho&quot;. Để trống nếu sản phẩm không có biến thể.
              </p>
              <VariantsEditor variants={variants} onChange={setVariants} />
            </div>
          )}

          {/* TAB 4: DETAILS & CATEGORY */}
          {activeTab === "details" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <p className={labelClass}>Phân loại danh mục</p>
                {hasNoCatalogData ? (
                  <p className="font-body-sm text-xs text-on-surface-variant p-3 bg-surface-container-low rounded-xl">
                    Không tải được danh mục — kiểm tra kết nối API rồi thử lại.
                  </p>
                ) : (
                  <CategoryPicker categories={categories} selectedCategoryId={categoryId} onChange={setCategoryId} />
                )}
              </div>
              <div>
                <p className={labelClass}>Thông số kỹ thuật chi tiết</p>
                <SpecsEditor specs={specs} onChange={setSpecs} />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="shrink-0 border-t border-outline-variant/30 px-4 sm:px-6 py-3 bg-surface-container-lowest flex items-center justify-between gap-3">
          {error ? (
            <p className="flex items-center gap-1.5 text-error font-label-md text-xs min-w-0">
              <Icon name="error" className="shrink-0 !text-[16px]" />
              <span className="truncate">{error}</span>
            </p>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 font-label-md text-xs sm:text-sm text-on-surface-variant hover:bg-surface-container border border-outline-variant/60 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <Button
              type="submit"
              form="product-form"
              disabled={saving || isUploadingImages}
              className="px-5 py-2 text-xs sm:text-sm font-medium rounded-xl shadow-xs"
            >
              <Icon name="cloud_upload" className="!text-[18px] mr-1" />
              {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng sản phẩm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}