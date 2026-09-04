import type { PaymentAccount, ReceivingMethod } from "@repo/types";
import type { PaymentDetail } from "@repo/ui/payment-card";

export type PaymentMethodGroup = {
  method: ReceivingMethod;
  label: string;
  description: string;
  accounts: PaymentAccount[];
};

export function paymentMethodLabel(method: ReceivingMethod) {
  return method === "MOBILE_MONEY" ? "Mobile money" : "Bank transfer";
}

export function groupPaymentAccounts(
  accounts: PaymentAccount[],
  preferredCurrency?: string,
): PaymentMethodGroup[] {
  const currency = preferredCurrency?.trim().toUpperCase();

  function sortGroup(items: PaymentAccount[]) {
    if (!currency) return items;
    return [...items].sort((a, b) => {
      const aMatch = a.currency_code.toUpperCase() === currency ? 0 : 1;
      const bMatch = b.currency_code.toUpperCase() === currency ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  const groups: PaymentMethodGroup[] = [
    {
      method: "BANK",
      label: "Bank transfer",
      description: "Pay from your bank using the account details below.",
      accounts: sortGroup(
        accounts.filter((account) => account.payment_method === "BANK"),
      ),
    },
    {
      method: "MOBILE_MONEY",
      label: "Mobile money",
      description: "Send to the mobile money wallet shown below.",
      accounts: sortGroup(
        accounts.filter((account) => account.payment_method === "MOBILE_MONEY"),
      ),
    },
  ];

  return groups.filter((group) => group.accounts.length > 0);
}

export function accountSummary(account: PaymentAccount) {
  if (account.payment_method === "BANK") {
    return [
      account.channel_name,
      account.account_number,
      account.currency_code,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return [account.channel_name, account.phone_number, account.currency_code]
    .filter(Boolean)
    .join(" · ");
}

export function paymentAccountDetails(
  account: PaymentAccount,
  reference: string,
): PaymentDetail[] {
  const details: PaymentDetail[] = [];

  if (account.channel_name) {
    details.push({ label: "Channel", value: account.channel_name });
  }

  details.push({
    label: "Account name",
    value: account.account_name,
    copyable: true,
  });

  if (account.payment_method === "BANK") {
    if (account.account_number) {
      details.push({
        label: "Account number",
        value: account.account_number,
        copyable: true,
      });
    }
    if (account.sort_code) {
      details.push({
        label: "Sort code",
        value: account.sort_code,
        copyable: true,
      });
    }
    if (account.iban) {
      details.push({
        label: "IBAN",
        value: account.iban,
        copyable: true,
      });
    }
  } else if (account.phone_number) {
    details.push({
      label: "Phone number",
      value: account.phone_number,
      copyable: true,
    });
  }

  details.push(
    {
      label: "Currency",
      value: account.currency_code,
    },
    {
      label: "Payment reference",
      value: reference,
      copyable: true,
    },
  );

  return details;
}
