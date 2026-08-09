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
    a: "Không. Website được dùng để giới thiệu sản phẩm, giá tham khảo, hình ảnh và video. Để hỏi thêm hoặc mua tại cửa hàng, bạn vui lòng liên hệ ZENOST qua trang Liên hệ hoặc Facebook.",
  },
  {
    q: "Giá và tình trạng sản phẩm trên website có chính xác tại mọi thời điểm không?",
    a: "Giá và tình trạng hàng được cập nhật để tham khảo nhưng có thể thay đổi tại cửa hàng. Bạn nên liên hệ ZENOST để xác nhận thông tin mới nhất.",
  },
  {
    q: "PRE-ORDER trên website có nghĩa là gì?",
    a: "PRE-ORDER là nhóm sản phẩm dự kiến hoặc đang nhận đăng ký trước tại cửa hàng. Website không tự động tạo đơn; bạn cần liên hệ ZENOST để được tư vấn và xác nhận.",
  },
  {
    q: "Tôi có thể xem video sản phẩm ở đâu?",
    a: "Các video TikTok và YouTube được gắn trong trang chi tiết sản phẩm. Bạn có thể xem nội dung thực tế và mở kênh gốc để theo dõi ZENOST.",
  },
  {
    q: "Các liên kết dẫn sang nền tảng khác có phải link affiliate không?",
    a: "Một số liên kết có thể là link giới thiệu hoặc affiliate. Nếu bạn mua qua các liên kết đó, ZENOST có thể nhận hoa hồng và bạn không phải trả thêm chi phí.",
  },
  {
    q: "Tôi muốn hỏi sản phẩm, bảo hành hoặc hợp tác thì làm thế nào?",
    a: "Bạn có thể gửi phiếu tại trang Liên hệ hoặc liên hệ trực tiếp qua Facebook, email và số điện thoại được hiển thị trên website.",
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
