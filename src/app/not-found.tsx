import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-md px-margin-mobile bg-surface">
      <p className="font-display-lg text-[80px] leading-none font-bold text-primary">404</p>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">
          Không tìm thấy trang
        </h1>
        <p className="text-on-surface-variant font-body-md max-w-112">
          Đường dẫn bạn truy cập không tồn tại.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-on-primary px-lg py-base rounded-lg font-label-md text-label-md hover:brightness-110 transition-all"
      >
        Về trang chủ ZENOS
      </Link>
    </div>
  );
}
