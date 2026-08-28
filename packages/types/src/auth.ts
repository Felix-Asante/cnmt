export type AuthRole = "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
  created_at: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};
