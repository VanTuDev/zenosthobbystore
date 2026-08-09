import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Cam kết chính hãng",
  description:
    "ZENOST Hobby Store cam kết 100% mô hình nhập khẩu chính hãng từ Good Smile Company, Bandai Spirits, Alter, Kotobukiya và các nhà sản xuất uy tín khác.",
  alternates: { canonical: "/cam-ket-chinh-hang" },
};

export default function AuthenticityPage() {
  return (
    <PolicyPage
      title="Cam kết chính hãng"
      intro="Mỗi mô hình tại ZENOS đều có nguồn gốc rõ ràng — nhập khẩu trực tiếp từ nhà sản xuất hoặc đại lý ủy quyền, không qua trung gian không xác thực."
    >
      <section>
        <h2>Nguồn hàng</h2>
        <p>
          Chúng tôi nhập khẩu trực tiếp từ Good Smile Company, Bandai Spirits, Alter, Kotobukiya,
          MegaHouse, Aniplex+ và các nhà sản xuất mô hình uy tín tại Nhật Bản. Mỗi lô hàng đều có
          hóa đơn nhập khẩu và mã lô sản xuất có thể tra cứu.
        </p>
      </section>
      <section>
        <h2>Kiểm định trước khi giao</h2>
        <ul>
          <li>Kiểm tra tem seal, hộp sản phẩm nguyên vẹn trước khi nhập kho.</li>
          <li>Đối chiếu số serial/mã lô với nhà phân phối chính thức.</li>
          <li>Kiểm tra ngoại quan chi tiết sơn, khớp nối trước khi đóng gói giao khách.</li>
        </ul>
      </section>
      <section>
        <h2>Cam kết hoàn tiền</h2>
        <p>
          Nếu phát hiện sản phẩm không chính hãng, ZENOS hoàn tiền 100% giá trị đơn hàng cộng phí
          vận chuyển hai chiều — không cần điều kiện kèm theo.
        </p>
      </section>
    </PolicyPage>
  );
}
