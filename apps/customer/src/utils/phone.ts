export function toE164(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  const compact = trimmed.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return compact;
  return `+${compact}`;
}

export function isE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
