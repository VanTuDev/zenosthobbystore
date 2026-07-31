import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/store/policy-page";
import { BusinessInfoCard } from "@/components/store/business-info-card";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ",
  description: "Điều khoản sử dụng website và dịch vụ mua sắm tại ZENOS Hobby Store.",
  alternates: { canonical: "/dieu-khoan" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Điều khoản dịch vụ"
      intro="Cập nhật lần cuối: 01/01/2026. Điều khoản này được xây dựng trên cơ sở Bộ luật Dân sự 2015, Luật Bảo vệ quyền lợi người tiêu dùng 2023 và Nghị định 52/2013/NĐ-CP về thương mại điện tử."
    >
      <section>
        <h2>1. Chủ thể vận hành website</h2>
        <p>Website zenoshobbystore.vn được vận hành bởi:</p>
        <BusinessInfoCard />
      </section>
      <section>
        <h2>2. Phạm vi áp dụng</h2>
        <p>
          Bằng việc truy cập và sử dụng website ZENOS Hobby Store, bạn đồng ý tuân thủ các điều
          khoản dưới đây. Đây là một trang demo mô phỏng cửa hàng thương mại điện tử, không xử lý
          giao dịch hoặc dữ liệu thanh toán thật.
        </p>
      </section>
      <section>
        <h2>3. Tài khoản người dùng</h2>
        <p>
          Bạn có thể tạo tài khoản thông qua đăng nhập Google. Bạn chịu trách nhiệm bảo mật thông
          tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình. ZENOS có quyền tạm khóa
          hoặc từ chối phục vụ tài khoản có dấu hiệu gian lận, lạm dụng hệ thống hoặc vi phạm điều
          khoản này.
        </p>
      </section>
      <section>
        <h2>4. Đặt hàng &amp; giá cả</h2>
        <p>
          Giá sản phẩm được niêm yết bằng VNĐ, đã bao gồm thuế giá trị gia tăng (nếu có) và có thể
          thay đổi mà không cần báo trước. Đơn hàng chỉ được xác nhận khi ZENOS gửi thông báo xác
          nhận qua email; ZENOS có quyền từ chối hoặc hủy đơn trong trường hợp hết hàng, sai giá do
          lỗi kỹ thuật hoặc nghi ngờ gian lận, và sẽ hoàn tiền đầy đủ nếu đã thanh toán.
        </p>
      </section>
      <section>
        <h2>5. Thanh toán, đổi trả &amp; giao hàng</h2>
        <p>
          Chi tiết phương thức thanh toán, điều kiện đổi trả/bảo hành và thời gian giao hàng được
          quy định cụ thể tại{" "}
          <Link href="/chinh-sach-thanh-toan" className="text-primary underline">
            Chính sách thanh toán
          </Link>
          ,{" "}
          <Link href="/chinh-sach-doi-tra" className="text-primary underline">
            Chính sách đổi trả &amp; bảo hành
          </Link>{" "}
          và{" "}
          <Link href="/chinh-sach-giao-hang" className="text-primary underline">
            Chính sách giao hàng
          </Link>
          , là một phần không tách rời của điều khoản này.
        </p>
      </section>
      <section>
        <h2>6. Quyền sở hữu trí tuệ</h2>
        <p>
          Toàn bộ nội dung, hình ảnh, thiết kế trên website thuộc quyền sở hữu của ZENOS Hobby
          Store hoặc các nhà sản xuất mô hình liên quan. Nghiêm cấm sao chép, sử dụng lại vì mục
          đích thương mại khi chưa được cho phép.
        </p>
      </section>
      <section>
        <h2>7. Giới hạn trách nhiệm</h2>
        <p>
          ZENOS không chịu trách nhiệm cho các thiệt hại phát sinh từ việc sử dụng sai mục đích
          hoặc bảo quản sản phẩm không đúng cách sau khi đã giao hàng thành công, cũng như các gián
          đoạn dịch vụ do sự kiện bất khả kháng nằm ngoài khả năng kiểm soát hợp lý.
        </p>
      </section>
      <section>
        <h2>8. Giải quyết tranh chấp</h2>
        <p>
          Mọi khiếu nại được ưu tiên giải quyết thông qua thương lượng, hòa giải trực tiếp giữa
          khách hàng và ZENOS qua các kênh liên hệ chính thức. Trường hợp không đạt được thỏa
          thuận, tranh chấp sẽ được giải quyết theo quy định pháp luật Việt Nam hiện hành, tại tòa
          án có thẩm quyền nơi ZENOS đặt trụ sở.
        </p>
      </section>
      <section>
        <h2>9. Thay đổi điều khoản</h2>
        <p>
          ZENOS có thể cập nhật điều khoản này theo thời gian để phù hợp với quy định pháp luật và
          hoạt động kinh doanh. Phiên bản mới nhất luôn được đăng tải tại trang này kèm ngày cập
          nhật.
        </p>
      </section>
    </PolicyPage>
  );
}
