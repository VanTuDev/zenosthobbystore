"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchUsers, updateUserRole, deleteUser } from "@/lib/api/users";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiUser } from "@/lib/api-types";

const PAGE_SIZE = 100;

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | ApiUser["role"]>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    const handle = setTimeout(
      () => {
        fetchUsers({ page: 1, pageSize: PAGE_SIZE, q: q || undefined, role: role || undefined })
          .then((res) => {
            if (cancelled) return;
            setUsers(res.items);
            setTotal(res.pagination.total);
            setLoadError(null);
          })
          .catch((err) => {
            if (cancelled) return;
            setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách người dùng.");
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false);
          });
      },
      q ? 300 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [q, role]);

  async function handleRoleToggle(target: ApiUser) {
    const nextRole = target.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    const confirmed = await confirm({
      title:
        nextRole === "ADMIN" ? `Cấp quyền quản trị cho "${target.name}"?` : `Bỏ quyền quản trị của "${target.name}"?`,
      description:
        nextRole === "ADMIN"
          ? "Người này sẽ có toàn quyền quản lý sản phẩm, danh mục, đơn hàng..."
          : "Người này sẽ mất quyền truy cập trang quản trị.",
      confirmLabel: nextRole === "ADMIN" ? "Cấp quyền" : "Bỏ quyền",
      tone: nextRole === "ADMIN" ? "default" : "danger",
    });
    if (!confirmed) return;

    setBusyId(target.id);
    try {
      const { user: updated } = await updateUserRole(target.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Đã cập nhật quyền của "${updated.name}".`, "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Cập nhật quyền thất bại.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(target: ApiUser) {
    const confirmed = await confirm({
      title: `Xóa tài khoản "${target.name}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      tone: "danger",
    });
    if (!confirmed) return;

    setBusyId(target.id);
    try {
      await deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setTotal((t) => t - 1);
      showToast(`Đã xóa tài khoản "${target.name}".`, "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Xóa thất bại.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-md mb-md flex-wrap">
        <div className="relative flex-1 min-w-64 max-w-96">
          <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Icon name="search" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "" | ApiUser["role"])}
          className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tất cả quyền</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="CUSTOMER">Khách hàng</option>
        </select>
        <p className="text-on-surface-variant font-body-md ml-auto">
          {isLoading ? "Đang tải…" : `${total} người dùng`}
        </p>
      </div>

      {loadError && (
        <p className="flex items-center gap-xs text-error text-label-md mb-md p-sm bg-error-container/20 rounded-lg">
          <Icon name="error" />
          {loadError}
        </p>
      )}

      {!isLoading && users.length === 0 && !loadError && (
        <div className="flex flex-col items-center gap-xs py-2xl text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
          <Icon name="group" className="!text-[32px] text-on-surface-variant" />
          <p className="font-label-md text-label-md text-on-surface-variant">Không tìm thấy người dùng nào.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Quyền
                  </th>
                  <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Tham gia
                  </th>
                  <th className="px-md py-md" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isBusy = busyId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-md py-md">
                        <div className="flex items-center gap-sm">
                          <UserAvatar avatarUrl={u.avatarUrl} initials={u.name.slice(0, 2).toUpperCase()} size={36} />
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate max-w-56">
                              {u.name} {isSelf && <span className="font-normal text-on-surface-variant">(Bạn)</span>}
                            </p>
                            <p className="text-label-sm text-on-surface-variant truncate max-w-56">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <Badge tone={u.role === "ADMIN" ? "primary" : "muted"}>
                          {u.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                        </Badge>
                      </td>
                      <td className="px-md py-md text-on-surface-variant font-body-md">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u)}
                            disabled={isBusy || isSelf}
                            title={isSelf ? "Không thể tự đổi quyền của mình" : u.role === "ADMIN" ? "Bỏ quyền quản trị" : "Cấp quyền quản trị"}
                            className="p-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-40"
                          >
                            <Icon name={u.role === "ADMIN" ? "person_remove" : "admin_panel_settings"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            disabled={isBusy || isSelf}
                            title={isSelf ? "Không thể tự xóa tài khoản của mình" : "Xóa tài khoản"}
                            className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors disabled:opacity-40"
                          >
                            <Icon
                              name={isBusy ? "progress_activity" : "delete"}
                              className={isBusy ? "animate-spin" : undefined}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-md bg-surface border-t border-outline-variant/20">
            <p className="text-label-sm text-on-surface-variant">Hiển thị {users.length} người dùng.</p>
          </div>
        </div>
      )}
    </div>
  );
}
