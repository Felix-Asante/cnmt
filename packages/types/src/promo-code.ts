export type PreviewPromoCode = {
  code: string;
  discount_percentage: string | number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percentage: string | number;
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
  created_at: string;
  updated_at: string;
};

export type CreatePromoCodePayload = {
  code: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
};

export type UpdatePromoCodePayload = {
  discount_percentage: string;
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
};
