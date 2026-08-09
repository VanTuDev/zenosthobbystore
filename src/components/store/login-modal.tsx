"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/ui/icon";
import { GoogleMark } from "@/components/ui/google-mark";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, isLoggingIn, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!isLoginModalOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLoginModal();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center px-margin-mobile"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeLoginModal();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative w-full max-w-96 rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Đóng"
          className="absolute right-md top-md z-10 flex items-center justify-center w-8 h-8 rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <Icon name="close" />
        </button>

        <div className="flex flex-col items-center text-center gap-sm bg-black px-lg pt-xl pb-lg">
          <span className="flex items-center justify-center w-20 h-20 rounded-full overflow-hidden ring-1 ring-white/15 mb-xs">
            <Image
              src="/LogoZENOSTHOBBYSTORE.png"
              alt="ZENOST"
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-contain"
              priority
            />
          </span>
          <h2 id="login-modal-title" className="font-headline-sm text-headline-sm text-white tracking-tight">
            Đăng nhập ZENOST
          </h2>
          <p className="font-body-md text-body-md text-white/60">
            Lưu sản phẩm yêu thích và nhận ưu đãi dành riêng cho bạn.
          </p>
        </div>

        <div className="p-lg">
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-sm px-md py-base rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white text-black transition-colors font-label-md text-label-md disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoggingIn ? (
              <>
                <Icon name="progress_activity" className="animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <GoogleMark className="w-5 h-5" />
                Đăng nhập với Google
              </>
            )}
          </button>

          <p className="font-body-md text-[12px] text-on-surface-variant text-center mt-md">
            Bằng việc tiếp tục, bạn đồng ý với điều khoản dịch vụ và chính sách quyền riêng tư của
            ZENOST.
          </p>
        </div>
      </div>
    </div>
  );
}
