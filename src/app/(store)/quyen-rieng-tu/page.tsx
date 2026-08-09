import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "Thông tin về dữ liệu được sử dụng khi truy cập website ZENOST Hobby Store.",
  alternates: { canonical: "/quyen-rieng-tu" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Quyền riêng tư"
      intro="ZENOST chỉ sử dụng thông tin cần thiết để vận hành tài khoản, danh sách yêu thích và phản hồi các phiếu liên hệ."
    >
      <section>
        <h2>Thông tin có thể được thu thập</h2>
        <ul>
          <li>Thông tin tài khoản Google như tên, email và ảnh đại diện khi bạn đăng nhập.</li>
          <li>Danh sách sản phẩm yêu thích được liên kết với tài khoản.</li>
          <li>Nội dung, email và hình ảnh bạn chủ động gửi qua phiếu liên hệ.</li>
          <li>Dữ liệu kỹ thuật cơ bản phục vụ bảo mật và vận hành website.</li>
        </ul>
      </section>
      <section>
        <h2>Mục đích sử dụng</h2>
        <p>
          Thông tin được dùng để duy trì phiên đăng nhập, lưu sản phẩm yêu thích, phản hồi yêu cầu và bảo vệ website.
          Website không thu thập thông tin thẻ và không xử lý thanh toán trực tuyến.
        </p>
      </section>
      <section>
        <h2>Liên kết bên ngoài</h2>
        <p>
          Khi bạn mở TikTok, YouTube, Facebook hoặc một liên kết affiliate, chính sách riêng tư của nền tảng đích sẽ
          được áp dụng. ZENOST không kiểm soát cách các nền tảng đó xử lý dữ liệu của bạn.
        </p>
      </section>
      <section>
        <h2>Yêu cầu liên quan đến dữ liệu</h2>
        <p>
          Bạn có thể sử dụng trang Liên hệ để yêu cầu kiểm tra, chỉnh sửa hoặc xóa thông tin cá nhân đã cung cấp cho ZENOST.
        </p>
      </section>
    </PolicyPage>
  );
}
