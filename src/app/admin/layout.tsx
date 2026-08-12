import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

export const metadata: Metadata = {
  title: {
    default: "Zenos Admin",
    template: "%s | Zenos Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-surface">
        <AdminSidebar />
        <AdminTopbar />
        <main className="min-w-0 p-margin-mobile md:p-margin-desktop lg:ml-64 max-w-[1920px]">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
