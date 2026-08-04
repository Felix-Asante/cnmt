export const HOME_DESTINATIONS = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "LR", name: "Liberia", flag: "🇱🇷" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose corridor and amount",
    description:
      "Select where you’re sending from, where it’s going, and how much. Rates and fees stay visible as you type.",
  },
  {
    step: "02",
    title: "Add your recipient",
    description:
      "Enter their name, phone, and payout method — mobile money or bank — in under a minute.",
  },
  {
    step: "03",
    title: "Pay, we verify, they receive",
    description:
      "Send the transfer with your reference, upload proof, and we confirm before payout begins.",
  },
] as const;

export const WHY_POINTS = [
  {
    title: "Secure & reliable",
    description:
      "Payments are verified before processing. Your details stay protected throughout.",
  },
  {
    title: "Fast after confirmation",
    description:
      "Once payment is confirmed, most transfers complete within minutes — not days.",
  },
  {
    title: "Wide receiving network",
    description:
      "Reach family and partners across multiple countries via mobile money or bank.",
  },
] as const;
