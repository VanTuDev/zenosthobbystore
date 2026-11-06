export type BankPaymentAccount = {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export const BANK_PAYMENT: BankPaymentAccount = {
  bankId: process.env.NEXT_PUBLIC_BANK_ID ?? "VPB",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "VPBank",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "0868237043",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "PHUNG HUY CUONG",
} as const;

export const SECONDARY_BANK_PAYMENT: BankPaymentAccount = {
  bankId: process.env.NEXT_PUBLIC_SECONDARY_BANK_ID ?? "MB",
  bankName: process.env.NEXT_PUBLIC_SECONDARY_BANK_NAME ?? "MB Bank",
  accountNumber: process.env.NEXT_PUBLIC_SECONDARY_BANK_ACCOUNT_NUMBER ?? "0925237031",
  accountName: process.env.NEXT_PUBLIC_SECONDARY_BANK_ACCOUNT_NAME ?? "PHUNG HUY CUONG",
};

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
  useSecondaryAccount?: boolean;
};

export function getDepositTransferContent(facebookName: string) {
  const normalizedName = facebookName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
  return normalizedName.slice(0, 25).trimEnd();
}

export function getDepositQrUrl(amount: number, facebookName: string, account: BankPaymentAccount = BANK_PAYMENT) {
  const query = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: getDepositTransferContent(facebookName),
    accountName: account.accountName,
  });

  return `https://img.vietqr.io/image/${account.bankId}-${account.accountNumber}-qr_only.png?${query.toString()}`;
}
