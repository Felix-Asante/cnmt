export const HOME_DESTINATION_CODES = [
  "GB",
  "FR",
  "ES",
  "MA",
  "GH",
  "NG",
  "SL",
  "LR",
  "KE",
  "UG",
] as const;

export const HOME_DESTINATION_FLAGS: Record<
  (typeof HOME_DESTINATION_CODES)[number],
  string
> = {
  GB: "🇬🇧",
  FR: "🇫🇷",
  ES: "🇪🇸",
  MA: "🇲🇦",
  GH: "🇬🇭",
  NG: "🇳🇬",
  SL: "🇸🇱",
  LR: "🇱🇷",
  KE: "🇰🇪",
  UG: "🇺🇬",
};

export const HOW_IT_WORKS_STEPS = ["corridor", "recipient", "pay"] as const;

export const WHY_POINT_KEYS = ["secure", "fast", "network"] as const;

export const TRUST_KEYS = ["verified", "references", "support"] as const;
