import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp (FAQ)",
  description:
    "Giải đáp các câu hỏi thường gặp về đặt trước, thanh toán, đổi trả và bảo quản mô hình tại ZENOS Hobby Store.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "Đặt trước (pre-order) hoạt động như thế nào?",
    a: "Bạn thanh toán trước một phần hoặc toàn bộ giá trị sản phẩm để giữ suất hàng. Khi hàng về kho, ZENOS sẽ thông báo qua email/SMS và giao hàng trong 5–7 ngày.",
  },
  {
    q: "Tôi có thể đổi trả sản phẩm không?",
    a: "Có. Sản phẩm còn nguyên seal, chưa qua sử dụng được đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Với lỗi từ nhà sản xuất, ZENOS hỗ trợ đổi trả trong 30 ngày.",
  },
  {
    q: "Làm sao để bảo quản mô hình không bị ố vàng hoặc phai màu?",
    a: "Tránh ánh nắng trực tiếp và nơi có độ ẩm cao. Nên trưng bày trong tủ kính có kiểm soát nhiệt độ, tránh để gần nguồn nhiệt (bóng đèn, cửa sổ hướng Tây).",
  },
  {
    q: "ZENOS có giao hàng quốc tế không?",
    a: "Hiện tại ZENOS chỉ giao hàng nội địa Việt Nam. Chúng tôi đang nghiên cứu mở rộng sang các thị trường Đông Nam Á trong thời gian tới.",
  },
  {
    q: "Tôi có thể hủy đơn đặt trước không?",
    a: "Có, bạn có thể hủy đơn đặt trước miễn phí trước khi hàng về kho. Sau khi hàng đã về kho và chuẩn bị giao, phí hủy đơn là 10% giá trị đặt cọc.",
  },
  {
    q: "Sản phẩm có được bảo hành không?",
    a: "Mô hình lắp ráp (Gunpla) được bảo hành lỗi khớp nối/linh kiện trong 30 ngày. Statue/scale figure được kiểm định trước khi giao nên không áp dụng bảo hành sau khi đã bóc seal.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <PolicyPage
      title="Câu hỏi thường gặp"
      intro="Chưa tìm thấy câu trả lời? Liên hệ đội ngũ ZENOS để được hỗ trợ trực tiếp."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="space-y-md">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group bg-surface-container-low rounded-xl p-md open:bg-white open:shadow-sm transition-colors"
          >
            <summary className="font-label-md text-label-md text-on-surface cursor-pointer list-none flex items-center justify-between gap-md">
              {item.q}
              <span className="text-on-surface-variant group-open:rotate-45 transition-transform text-xl leading-none">
                +
              </span>
            </summary>
            <p className="text-on-surface-variant font-body-md leading-relaxed mt-sm">{item.a}</p>
          </details>
        ))}
      </div>
    </PolicyPage>
  );
}
