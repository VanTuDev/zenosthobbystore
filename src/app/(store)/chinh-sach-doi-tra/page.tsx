import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Chính sách đổi trả & bảo hành",
  description:
    "Điều kiện, thời hạn và quy trình đổi trả, hoàn tiền và bảo hành mô hình tại ZENOS Hobby Store.",
  alternates: { canonical: "/chinh-sach-doi-tra" },
};

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Chính sách đổi trả & bảo hành"
      intro="Áp dụng theo Luật Bảo vệ quyền lợi người tiêu dùng 2023 — ZENOS hỗ trợ đổi trả, hoàn tiền minh bạch cho mọi đơn hàng đủ điều kiện."
    >
      <section>
        <h2>Điều kiện đổi trả</h2>
        <ul>
          <li>Sản phẩm còn nguyên seal, hộp, phụ kiện đi kèm và chưa qua sử dụng/lắp ráp.</li>
          <li>Yêu cầu đổi trả được gửi trong vòng 7 ngày kể từ ngày nhận hàng (theo dấu bưu điện/vận đơn).</li>
          <li>Có hóa đơn hoặc mã đơn hàng làm căn cứ đối chiếu.</li>
          <li>
            Sản phẩm lỗi do nhà sản xuất (sai khớp nối, thiếu linh kiện, lỗi sơn) được đổi trả
            trong vòng 30 ngày kể từ ngày nhận hàng, không yêu cầu còn nguyên seal.
          </li>
        </ul>
      </section>
      <section>
        <h2>Trường hợp không áp dụng đổi trả</h2>
        <ul>
          <li>Sản phẩm đã bóc seal, lắp ráp, sơn vẽ hoặc có dấu hiệu qua sử dụng (trừ trường hợp lỗi nhà sản xuất).</li>
          <li>Statue/scale figure đã kiểm định và bàn giao đạt yêu cầu, khách đổi ý không phải do lỗi sản phẩm.</li>
          <li>Sản phẩm thuộc chương trình đặt trước (pre-order) đã quá thời hạn hủy miễn phí quy định tại mục &quot;Hủy đơn đặt trước&quot;.</li>
        </ul>
      </section>
      <section>
        <h2>Quy trình đổi trả</h2>
        <ul>
          <li>Bước 1: Gửi yêu cầu qua email support@zenoshobbystore.vn hoặc hotline 1900 6868, kèm ảnh/video hiện trạng sản phẩm.</li>
          <li>Bước 2: ZENOS xác nhận yêu cầu trong vòng 24 giờ làm việc và hướng dẫn gửi hàng về kho.</li>
          <li>Bước 3: Sau khi nhận và kiểm tra hàng hoàn, ZENOS xử lý đổi mới hoặc hoàn tiền trong 3–5 ngày làm việc.</li>
          <li>Phí vận chuyển hoàn hàng do ZENOS chi trả nếu lỗi thuộc về sản phẩm/nhà sản xuất; do khách hàng chi trả nếu đổi ý.</li>
        </ul>
      </section>
      <section>
        <h2>Hoàn tiền</h2>
        <p>
          Tiền hoàn được chuyển về phương thức thanh toán gốc (chuyển khoản, ví điện tử) hoặc tài
          khoản ngân hàng do khách hàng cung cấp, trong vòng 3–5 ngày làm việc kể từ khi yêu cầu
          được chấp thuận. Đơn hàng thanh toán COD được hoàn qua chuyển khoản.
        </p>
      </section>
      <section>
        <h2>Bảo hành</h2>
        <ul>
          <li>Mô hình lắp ráp (Gunpla, model kit): bảo hành lỗi khớp nối, linh kiện thiếu/hỏng trong 30 ngày kể từ ngày nhận hàng.</li>
          <li>Statue/scale figure: được kiểm định trước khi giao; không áp dụng bảo hành sau khi đã bóc seal, trừ lỗi ẩn từ nhà sản xuất phát hiện trong 7 ngày đầu.</li>
          <li>Bảo hành không áp dụng với hư hỏng do rơi vỡ, va đập, ẩm mốc hoặc bảo quản sai cách sau khi nhận hàng.</li>
        </ul>
      </section>
    </PolicyPage>
  );
}
