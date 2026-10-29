import type { BankPayoutKind, ReceivingMethod } from "./constants";

const CORRIDORS_KEY = "cnmt.recent-corridors";
const RECIPIENTS_KEY = "cnmt.saved-recipients";

export type RecentCorridor = {
  senderCountryCode: string;
  recipientCountryCode: string;
};

export type SavedRecipient = {
  id: string;
  name: string;
  phone: string;
  receivingMethod: ReceivingMethod;
  bankPayoutKind?: BankPayoutKind;
  network?: string;
  bank?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  iban?: string;
  senderCountryCode: string;
  recipientCountryCode: string;
  sendCurrency: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function recipientKey(
  recipient: Pick<
    SavedRecipient,
    "phone" | "bankAccountNumber" | "iban" | "recipientCountryCode" | "name"
  >,
) {
  const identity =
    recipient.phone ||
    recipient.iban ||
    recipient.bankAccountNumber ||
    recipient.name.toLowerCase();
  return `${identity}-${recipient.recipientCountryCode}`;
}

export function getRecentCorridors(): RecentCorridor[] {
  return readJson<RecentCorridor[]>(CORRIDORS_KEY, []);
}

export function rememberCorridor(corridor: RecentCorridor) {
  const existing = getRecentCorridors().filter(
    (item) =>
      !(
        item.senderCountryCode === corridor.senderCountryCode &&
        item.recipientCountryCode === corridor.recipientCountryCode
      ),
  );
  writeJson(CORRIDORS_KEY, [corridor, ...existing].slice(0, 4));
}

export function getSavedRecipients(): SavedRecipient[] {
  return readJson<SavedRecipient[]>(RECIPIENTS_KEY, []);
}

export function rememberRecipient(recipient: Omit<SavedRecipient, "id">) {
  const nextKey = recipientKey(recipient);
  const existing = getSavedRecipients().filter(
    (item) => recipientKey(item) !== nextKey,
  );
  const next: SavedRecipient = {
    ...recipient,
    id: nextKey,
  };
  writeJson(RECIPIENTS_KEY, [next, ...existing].slice(0, 6));
}
