import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Footer from "@/components/footer";
import Header from "@/components/header";
import ThemeSwitch from "@/components/theme-switch";
import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";
import { siteProfile } from "@/content/portfolio";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://vijayjangir.com"),
  title: {
    default: siteProfile.name,
    template: `%s | ${siteProfile.name}`,
  },
  description:
    "Data and platform engineer focused on streaming systems, backend services, structured resume flows, and reliable product foundations.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteProfile.name,
    description:
      "Data and platform engineer focused on streaming systems, backend services, structured resume flows, and reliable product foundations.",
    url: "https://vijayjangir.com",
    siteName: siteProfile.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteProfile.name,
    description:
      "Data and platform engineer focused on streaming systems, backend services, structured resume flows, and reliable product foundations.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="!scroll-smooth" lang="en">
      <body
        className={`${inter.className} relative bg-gray-50 pt-28 text-gray-950 sm:pt-36 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90`}
      >
        <div className="absolute right-[11rem] top-[-6rem] -z-10 h-[31.25rem] w-[31.25rem] rounded-full bg-[#fbe2e3] blur-[10rem] sm:w-[68.75rem] dark:bg-[#946263]" />
        <div className="absolute left-[-35rem] top-[-1rem] -z-10 h-[31.25rem] w-[50rem] rounded-full bg-[#dbd7fb] blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#676394]" />

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <Header />
            {children}
            <Footer />

            <Toaster position="top-right" />
            <ThemeSwitch />
            <Analytics />
            <SpeedInsights />
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
