import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng website giới thiệu sản phẩm và nội dung của ZENOST Hobby Store.",
  alternates: { canonical: "/dieu-khoan" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Điều khoản sử dụng"
      intro="Các điều khoản dưới đây áp dụng khi bạn xem sản phẩm, video và sử dụng các kênh liên hệ trên website ZENOST Hobby Store."
    >
      <section>
        <h2>1. Mục đích của website</h2>
        <p>
          Website cung cấp thông tin tham khảo về sản phẩm hobby, hình ảnh, giá, tình trạng tại cửa hàng và nội dung
          video từ các kênh của ZENOST. Website không có giỏ hàng, không tạo đơn và không xử lý thanh toán trực tuyến.
        </p>
      </section>
      <section>
        <h2>2. Thông tin sản phẩm</h2>
        <p>
          ZENOST cố gắng cập nhật thông tin chính xác, tuy nhiên giá, tình trạng hàng, thông số và lịch PRE-ORDER có
          thể thay đổi. Vui lòng liên hệ cửa hàng để xác nhận trước khi đưa ra quyết định mua hàng.
        </p>
      </section>
      <section>
        <h2>3. Video và liên kết bên ngoài</h2>
        <p>
          Website có thể dẫn đến TikTok, YouTube, Facebook hoặc nền tảng của bên thứ ba. Một số liên kết trong tương
          lai có thể là liên kết affiliate; ZENOST có thể nhận hoa hồng khi bạn thực hiện giao dịch mà không làm tăng
          chi phí của bạn. Điều kiện giao dịch tại nền tảng đích do nền tảng hoặc đơn vị bán hàng đó quy định.
        </p>
      </section>
      <section>
        <h2>4. Tài khoản và nội dung yêu thích</h2>
        <p>
          Tính năng đăng nhập được dùng để nhận diện người dùng và lưu các sản phẩm yêu thích. Bạn có trách nhiệm bảo
          vệ tài khoản đăng nhập của mình và không sử dụng website cho mục đích gây ảnh hưởng đến hệ thống hoặc người khác.
        </p>
      </section>
      <section>
        <h2>5. Quyền sở hữu nội dung</h2>
        <p>
          Hình ảnh, bài viết và thiết kế do ZENOST tạo ra không được sao chép cho mục đích thương mại khi chưa có sự
          đồng ý. Nhãn hiệu và nội dung từ nền tảng khác thuộc quyền của chủ sở hữu tương ứng.
        </p>
      </section>
      <section>
        <h2>6. Liên hệ</h2>
        <p>
          Nếu phát hiện thông tin, video hoặc liên kết chưa chính xác, bạn có thể gửi phiếu tại trang Liên hệ để ZENOST
          kiểm tra và cập nhật.
        </p>
      </section>
    </PolicyPage>
  );
}
