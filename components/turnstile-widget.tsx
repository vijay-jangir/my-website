"use client";

import Script from "next/script";

type TurnstileWidgetProps = {
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
};

export default function TurnstileWidget({
  siteKey,
  theme = "light",
}: TurnstileWidgetProps) {
  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile mt-4 flex justify-center"
        data-sitekey={siteKey}
        data-theme={theme}
      />
    </>
  );
}
