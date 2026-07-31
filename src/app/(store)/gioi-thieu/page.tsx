import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";
import { BusinessInfoCard } from "@/components/store/business-info-card";

export const metadata: Metadata = {
  title: "Giới thiệu & thông tin doanh nghiệp",
  description:
    "Thông tin hộ kinh doanh vận hành ZENOS Hobby Store — công khai theo quy định về thương mại điện tử.",
  alternates: { canonical: "/gioi-thieu" },
};

export default function AboutPage() {
  return (
    <PolicyPage
      title="Giới thiệu"
      intro="ZENOS Hobby Store là điểm đến cho những người chơi hobby chuyên nghiệp tại Việt Nam, chuyên cung cấp mô hình anime, Gunpla và statue chính hãng."
    >
      <section>
        <h2>Về chúng tôi</h2>
        <p>
          Thành lập từ niềm đam mê sưu tầm mô hình, ZENOS Hobby Store hướng đến việc mang những sản
          phẩm chính hãng, chất lượng cao từ Nhật Bản đến tay người chơi hobby Việt Nam, cùng dịch
          vụ tư vấn và hậu mãi tận tâm.
        </p>
      </section>
      <section>
        <h2>Thông tin thương nhân</h2>
        <p>
          Theo quy định tại Nghị định 52/2013/NĐ-CP (sửa đổi, bổ sung bởi Nghị định 85/2021/NĐ-CP)
          về thương mại điện tử, ZENOS Hobby Store công khai thông tin chủ thể vận hành website
          như sau:
        </p>
        <BusinessInfoCard />
      </section>
      <section>
        <h2>Giờ làm việc &amp; hỗ trợ khách hàng</h2>
        <p>
          Đội ngũ chăm sóc khách hàng của ZENOS làm việc từ 8:00 – 21:00 tất cả các ngày trong
          tuần, kể cả cuối tuần và ngày lễ (trừ Tết Nguyên Đán), qua hotline, email và showroom.
        </p>
      </section>
    </PolicyPage>
  );
}
