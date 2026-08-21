export const BANK_PAYMENT = {
  bankId: process.env.NEXT_PUBLIC_BANK_ID ?? "VPB",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "VPBank",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "0868237043",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "PHUNG HUY CUONG",
} as const;

export const DEPOSIT_PREVIEW_STORAGE_PREFIX = "zenost-deposit-preview:";

export type DepositPreviewDraft = {
  createdAt: number;
  facebookName: string;
  facebookUrl: string;
  items: Array<{
    name: string;
    variantName: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  depositAmount: number;
  remainingAmount: number;
};

export function getDepositTransferContent(facebookName: string) {
  const suffix = " CT";
  const normalizedName = facebookName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
  const name = normalizedName.slice(0, 25 - suffix.length).trimEnd();
  return `${name}${suffix}`;
}

export function getDepositQrUrl(amount: number, facebookName: string) {
  const query = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: getDepositTransferContent(facebookName),
    accountName: BANK_PAYMENT.accountName,
  });

  return `https://img.vietqr.io/image/${BANK_PAYMENT.bankId}-${BANK_PAYMENT.accountNumber}-qr_only.png?${query.toString()}`;
}
