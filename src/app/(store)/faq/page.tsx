import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp (FAQ)",
  description: "Giải đáp cách xem sản phẩm, video thực tế, PRE-ORDER và liên hệ với ZENOST Hobby Store.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "Website ZENOST có bán hàng và thanh toán trực tuyến không?",
    a: "Không. Website được dùng để giới thiệu sản phẩm, giá tham khảo, hình ảnh và video review đến từ Tiktok và Youtube.",
  },
  {
    q: "Giá và tình trạng sản phẩm trên website có chính xác tại mọi thời điểm không?",
    a: "Giá và tình trạng hàng được cập nhật để tham khảo nhưng có thể thay đổi tùy cửa hàng, tùy thời điểm.",
  },
  {
    q: "Có phải quay video khi nhận hàng?",
    a: "Shop đã quay toàn bộ quy trình đóng gói trước khi gửi hàng. Tất cả các đơn hàng online bắt buộc phải quay video khi nhận hàng và mở hàng. Video hợp lệ là toàn bộ quy trình quay 6 mặt của đơn hàng khi nhận hàng từ tay bưu tá, sau đó được mở ra và quay toàn bộ quy trình kiểm tra hàng bên trong. Các video tuyệt đối không được cắt ghép, dừng ngắt đoạn. Nếu không có video hoặc video bị chỉnh sửa, ZENOST từ chối bảo hành mọi trường hợp.",
  },
  {
    q: "Chính sách bảo hành các sản phẩm Bootleg như thế nào?",
    a: "Các sản phẩm Bootleg không có chính sách bảo hành từ nhà sản xuất. ZENOST sẽ hỗ trợ đảm bảo các bạn sẽ nhận đúng mẫu, đủ phụ kiện cũng như mọi thứ còn nằm trong vỉ. Đối với các trường hợp gãy vỡ do lỗi vận chuyển, ZENOST sẽ hỗ trợ khiếu nại đối với đơn vị vận chuyển.",
  },
  {
    q: "Chính sách bảo hành các sản phẩm GAO super sentai như thế nào?",
    a: "Các sản phẩm Gao xuất phát từ Thái Lan hoặc 2nd sẽ được đảm bảo rằng gửi đúng mẫu, đủ mẫu còn nguyên trong hộp/khay. Đối với các trường hợp bị gãy/vỡ hoặc lỗi nghiêm trọng sẽ có thể được hoàn trả 1 phần chi phí để fix. Shop sẽ hỗ trợ gửi clip khiếu nại đến xưởng/đại lý để nhận quyết định cuối cùng .",
  },
  {
    q: "Chính sách bảo hành các sản phẩm Blokees như thế nào?",
    a: "Các sản phẩm Blokees sẽ được đảm bảo rằng gửi đúng mẫu, đủ mẫu còn nguyên niêm phong. Đối với các trường hợp móp hộp hoặc bị thiếu mảnh trong hộp còn nguyên niêm phong sẽ không được bảo hành.",
  },
  {
    q: "Tôi có thể xem video sản phẩm ở đâu?",
    a: "Các video TikTok và YouTube được gắn trong trang chi tiết sản phẩm. Bạn có thể xem nội dung thực tế và mở kênh gốc để theo dõi ZENOST.",
  },
  {
    q: "Các liên kết dẫn sang nền tảng khác có phải link affiliate không?",
    a: "Một số liên kết có thể là link giới thiệu hoặc affiliate. Nếu bạn mua qua các liên kết đó, ZENOST có thể nhận hoa hồng và bạn không phải trả thêm chi phí.",
  }
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
      intro="Thông tin cần biết khi khám phá sản phẩm và nội dung của ZENOST. Nếu chưa tìm thấy câu trả lời, bạn có thể gửi phiếu liên hệ cho chúng tôi."
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
