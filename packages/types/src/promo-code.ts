/**
 * SEND_AMOUNT: discount is taken off what the sender pays.
 * RECIPIENT_AMOUNT: sender pays in full; the discount (converted at the rate)
 * is added to what the recipient gets.
 */
export type PromoDiscountTarget = "SEND_AMOUNT" | "RECIPIENT_AMOUNT";

export type PreviewPromoCode = {
  code: string;
  discount_percentage: string | number;
  discount_target: PromoDiscountTarget;
  applies_to_all_routes: boolean;
};

export type PromoRouteRule = {
  route_id: string;
  discount_target: PromoDiscountTarget;
  /** Optional override; when absent the code's percentage is used. */
  discount_percentage?: string | number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percentage: string | number;
  discount_target: PromoDiscountTarget;
  applies_to_all_routes: boolean;
  routes: (PromoRouteRule & {
    source_country_name: string;
    destination_country_name: string;
  })[];
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
  created_at: string;
  updated_at: string;
};

/** Update replaces the whole code, including its route rules. */
export type UpdatePromoCodePayload = {
  discount_percentage: string;
  discount_target: PromoDiscountTarget;
  applies_to_all_routes: boolean;
  routes: PromoRouteRule[];
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
};

export type CreatePromoCodePayload = UpdatePromoCodePayload & {
  code: string;
};
