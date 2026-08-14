import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Password must be at least 8 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginValues = {
  email: "",
  password: "",
};
