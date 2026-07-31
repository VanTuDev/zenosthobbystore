import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Chính sách thanh toán",
  description:
    "Các phương thức thanh toán được hỗ trợ và quy trình xử lý giao dịch tại ZENOS Hobby Store.",
  alternates: { canonical: "/chinh-sach-thanh-toan" },
};

export default function PaymentPolicyPage() {
  return (
    <PolicyPage
      title="Chính sách thanh toán"
      intro="ZENOS hỗ trợ nhiều phương thức thanh toán để bạn lựa chọn phù hợp nhất, đảm bảo an toàn cho mọi giao dịch."
    >
      <section>
        <h2>Phương thức thanh toán</h2>
        <ul>
          <li>Thanh toán khi nhận hàng (COD) — áp dụng cho đơn hàng nội địa, giới hạn giá trị 10.000.000₫/đơn.</li>
          <li>Chuyển khoản ngân hàng — đơn hàng được xử lý sau khi ZENOS xác nhận đã nhận tiền.</li>
          <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB) qua cổng thanh toán trung gian đạt chuẩn bảo mật PCI DSS.</li>
          <li>Ví điện tử (Momo, ZaloPay, VNPay).</li>
        </ul>
      </section>
      <section>
        <h2>Đặt cọc cho đơn đặt trước (pre-order)</h2>
        <p>
          Đơn đặt trước yêu cầu đặt cọc tối thiểu 30% giá trị sản phẩm để giữ suất hàng. Số tiền
          còn lại được thanh toán khi hàng về kho và trước khi giao. Cọc được hoàn lại 100% nếu
          ZENOS không thể cung cấp sản phẩm như cam kết.
        </p>
      </section>
      <section>
        <h2>Hóa đơn</h2>
        <p>
          Hóa đơn điện tử được gửi qua email sau khi đơn hàng hoàn tất thanh toán. Khách hàng có
          nhu cầu xuất hóa đơn giá trị gia tăng (VAT) cho tổ chức/doanh nghiệp vui lòng cung cấp
          thông tin xuất hóa đơn khi đặt hàng hoặc trong vòng 24 giờ sau khi đặt hàng.
        </p>
      </section>
      <section>
        <h2>An toàn giao dịch</h2>
        <p>
          ZENOS không lưu trữ thông tin thẻ thanh toán trên hệ thống của mình. Mọi giao dịch thẻ
          được xử lý trực tiếp bởi cổng thanh toán trung gian được cấp phép bởi Ngân hàng Nhà nước
          Việt Nam. Đây là bản demo giao diện nên không có cổng thanh toán thật nào được kết nối.
        </p>
      </section>
    </PolicyPage>
  );
}
