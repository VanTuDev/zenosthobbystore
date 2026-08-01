import type { Metadata } from "next";
import { AdminFinanceSection } from "./_components/admin-finance-section";

export const metadata: Metadata = {
  title: "Tài chính",
  description: "Theo dõi dòng tiền, doanh thu và chi phí của Zenos Hobby Store.",
};

export default function AdminFinancePage() {
  return <AdminFinanceSection />;
}
