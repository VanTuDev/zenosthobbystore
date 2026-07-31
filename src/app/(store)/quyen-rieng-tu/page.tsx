import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/store/policy-page";
import { BusinessInfoCard } from "@/components/store/business-info-card";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description: "Cách ZENOS Hobby Store thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng.",
  alternates: { canonical: "/quyen-rieng-tu" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Chính sách quyền riêng tư"
      intro="Cập nhật lần cuối: 01/01/2026. Chính sách này được xây dựng trên cơ sở Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và Luật An toàn thông tin mạng."
    >
      <section>
        <h2>1. Bên kiểm soát dữ liệu</h2>
        <BusinessInfoCard />
      </section>
      <section>
        <h2>2. Thông tin chúng tôi thu thập</h2>
        <ul>
          <li>Thông tin tài khoản: tên, email, ảnh đại diện khi bạn đăng nhập bằng Google.</li>
          <li>Thông tin đơn hàng: địa chỉ giao hàng, số điện thoại, lịch sử mua hàng.</li>
          <li>Dữ liệu trình duyệt: sản phẩm yêu thích, sản phẩm đã xem, giỏ hàng — lưu cục bộ trên thiết bị của bạn.</li>
          <li>Dữ liệu liên hệ: nội dung bạn gửi qua biểu mẫu liên hệ hoặc trao đổi với bộ phận chăm sóc khách hàng.</li>
        </ul>
      </section>
      <section>
        <h2>3. Mục đích sử dụng</h2>
        <p>
          Thông tin được dùng để xử lý đơn hàng, chăm sóc khách hàng, cá nhân hóa trải nghiệm mua
          sắm, phòng chống gian lận và gửi thông báo về sản phẩm/khuyến mãi nếu bạn đăng ký nhận
          tin. ZENOS không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích quảng cáo.
        </p>
      </section>
      <section>
        <h2>4. Chia sẻ dữ liệu với bên thứ ba</h2>
        <p>
          ZENOS chỉ chia sẻ dữ liệu cần thiết với các đối tác phục vụ vận hành đơn hàng — đơn vị
          vận chuyển (để giao hàng), cổng thanh toán trung gian (để xử lý giao dịch) — và chỉ trong
          phạm vi hoàn thành đơn hàng của bạn. Các đối tác này có nghĩa vụ bảo mật thông tin tương
          đương với cam kết của ZENOS.
        </p>
      </section>
      <section>
        <h2>5. Lưu trữ &amp; bảo mật</h2>
        <p>
          Đây là bản demo giao diện — không có máy chủ hoặc cơ sở dữ liệu thật. Dữ liệu tài khoản,
          yêu thích và giỏ hàng minh họa chỉ được lưu tạm trên trình duyệt của bạn (localStorage)
          và không được gửi đi bất cứ đâu. Trên hệ thống thật, dữ liệu cá nhân sẽ được lưu trữ có
          mã hóa và chỉ nhân sự được phân quyền mới có thể truy cập.
        </p>
      </section>
      <section>
        <h2>6. Cookie &amp; dữ liệu trình duyệt</h2>
        <p>
          Website sử dụng bộ nhớ cục bộ (localStorage) của trình duyệt để ghi nhớ đăng nhập, giỏ
          hàng và sản phẩm yêu thích giữa các lượt truy cập. Bạn có thể xóa dữ liệu này bất kỳ lúc
          nào qua cài đặt trình duyệt.
        </p>
      </section>
      <section>
        <h2>7. Quyền của bạn</h2>
        <p>
          Theo Nghị định 13/2023/NĐ-CP, bạn có quyền được biết, đồng ý, truy cập, rút lại sự đồng
          ý, xóa, hạn chế xử lý và phản đối việc xử lý dữ liệu cá nhân của mình. Bạn có thể thực
          hiện các quyền này bất kỳ lúc nào bằng cách liên hệ đội ngũ hỗ trợ qua trang{" "}
          <Link href="/lien-he" className="text-primary underline">
            Liên hệ
          </Link>
          .
        </p>
      </section>
    </PolicyPage>
  );
}
