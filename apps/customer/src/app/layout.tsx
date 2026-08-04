import type { Metadata } from "next";
import { Barlow_Condensed, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Schibsted_Grotesk({
  variable: "--font-sans-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C.N International Money Transfer",
  description: "Secure, reliable international money transfer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
