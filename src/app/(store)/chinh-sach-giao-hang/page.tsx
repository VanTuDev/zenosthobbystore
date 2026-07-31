import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Chính sách giao hàng",
  description:
    "Thời gian, phí vận chuyển và quy trình đóng gói đơn hàng tại ZENOS Hobby Store — giao hàng toàn quốc, đóng gói chống sốc 2 lớp cho mọi mô hình.",
  alternates: { canonical: "/chinh-sach-giao-hang" },
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Chính sách giao hàng"
      intro="ZENOS cam kết đưa từng mô hình đến tay bạn nguyên vẹn như lúc rời xưởng — từ đóng gói chống sốc đến thời gian giao hàng minh bạch."
    >
      <section>
        <h2>Thời gian giao hàng</h2>
        <ul>
          <li>Giao hàng tiêu chuẩn: 3–5 ngày làm việc trong nội thành, 5–7 ngày với khu vực khác.</li>
          <li>Giao hàng hỏa tốc (nội thành TP.HCM &amp; Hà Nội): 1–2 ngày làm việc.</li>
          <li>Đơn đặt trước (pre-order): giao trong vòng 5–7 ngày kể từ ngày hàng về kho, thông báo qua email.</li>
        </ul>
      </section>
      <section>
        <h2>Phí vận chuyển</h2>
        <ul>
          <li>Miễn phí giao hàng tiêu chuẩn cho đơn hàng từ 1.500.000₫.</li>
          <li>Giao hàng hỏa tốc: phụ thu 45.000₫, không phân biệt giá trị đơn hàng.</li>
          <li>Đơn hàng dưới 1.500.000₫ áp dụng phí vận chuyển tiêu chuẩn theo khu vực.</li>
        </ul>
      </section>
      <section>
        <h2>Đóng gói bảo vệ</h2>
        <p>
          Mọi mô hình được bọc đệm khí, cố định trong hộp carton 2 lớp chuyên dụng chống sốc — đặc
          biệt với các sản phẩm scale lớn hoặc có chi tiết rời (vũ khí, đế trưng bày, hiệu ứng
          trong suốt).
        </p>
      </section>
      <section>
        <h2>Theo dõi đơn hàng</h2>
        <p>
          Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận mã vận đơn qua email/SMS để
          theo dõi hành trình. Với tài khoản đã đăng nhập, bạn có thể xem lại lịch sử đơn hàng
          trong mục tài khoản.
        </p>
      </section>
    </PolicyPage>
  );
}
