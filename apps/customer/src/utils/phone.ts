export * from "@repo/utils/countries";

import { normalizePhoneToE164, isE164 } from "@repo/utils/countries";

export function toE164(phone: string, defaultCallingCode = "+212") {
  return normalizePhoneToE164(phone, defaultCallingCode);
}

export { isE164 };
