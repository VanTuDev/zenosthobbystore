import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersManager } from "./_components/users-manager";

export const metadata: Metadata = {
  title: "Quản lý Người dùng",
  description: "Xem và phân quyền các tài khoản đã đăng nhập vào Zenos Hobby Store.",
};

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader
        title="Quản lý Người dùng"
        description="Xem danh sách tài khoản đã đăng nhập và cấp/bỏ quyền quản trị."
      />

      <UsersManager />
    </>
  );
}
