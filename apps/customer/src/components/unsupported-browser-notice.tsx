import { getTranslations } from "next-intl/server";

// Plain ES5 on purpose: this must run on browsers that can't parse the app
// bundle. color-mix() (Safari 16.2+, Chrome 111+) is a good proxy for the
// CSS features Tailwind v4 needs.
const DETECT_SCRIPT = `(function(){try{var ok=window.CSS&&CSS.supports&&CSS.supports("color","color-mix(in srgb, red, blue)");if(!ok){var el=document.getElementById("unsupported-browser");if(el){el.removeAttribute("hidden");}}}catch(e){}})();`;

/**
 * Hidden by default and revealed by an inline script on outdated browsers.
 * Styled inline so it stays readable even when the Tailwind stylesheet
 * fails to apply.
 */
export async function UnsupportedBrowserNotice() {
  const t = await getTranslations("UnsupportedBrowser");

  return (
    <>
      <div
        id="unsupported-browser"
        role="alert"
        hidden
        suppressHydrationWarning
        style={{
          background: "#fdf3dd",
          borderBottom: "1px solid #e8a317",
          color: "#0a1a2f",
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: 1.5,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <strong style={{ display: "block", marginBottom: "4px" }}>
          {t("title")}
        </strong>
        {t("body")}
      </div>
      <script dangerouslySetInnerHTML={{ __html: DETECT_SCRIPT }} />
    </>
  );
}
