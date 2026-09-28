import type { Metadata } from "next";
import { Barlow_Condensed, Schibsted_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "@repo/ui/toast";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import "../globals.css";


const display = Barlow_Condensed({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Schibsted_Grotesk({
  variable: "--font-sans-family",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
