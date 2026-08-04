import type { ReceivingMethod } from "./constants";

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
  network?: string;
  bank?: string;
  senderCountryCode: string;
  recipientCountryCode: string;
  sendCurrency: "GBP" | "EUR" | "USD";
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
  const existing = getSavedRecipients().filter(
    (item) =>
      !(
        item.phone === recipient.phone &&
        item.recipientCountryCode === recipient.recipientCountryCode
      ),
  );
  const next: SavedRecipient = {
    ...recipient,
    id: `${recipient.phone}-${recipient.recipientCountryCode}`,
  };
  writeJson(RECIPIENTS_KEY, [next, ...existing].slice(0, 6));
}
