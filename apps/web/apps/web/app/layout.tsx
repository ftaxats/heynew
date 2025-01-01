import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "../styles/globals.css";
import { PostHogPageview, PostHogProvider } from "@/providers/PostHogProvider";
import { env } from "@/env";
import { GlobalProviders } from "@/providers/GlobalProviders";
import { UTM } from "@/app/utm";
import { startupImage } from "@/app/startup-image";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: true,
  display: "swap",
});
const calFont = localFont({
  src: "../styles/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "swap",
});

const title = "AI Email Management & Gmail Cleanup Tool | Mailto Live App";
const description =
  "Effortless email management with AI. Clean Gmail, bulk unsubscribe & smart label organization. The best Unroll.me alternative. Try free for 7 days.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Mailto Live",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@mailto_live",
  },
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "Mailto Live",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mailto Live",
    startupImage,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "white-translucent",
  },
};

export const viewport = {
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`h-full ${inter.variable} ${calFont.variable} font-sans antialiased`}
      >
        <PostHogProvider>
          <Suspense>
            <PostHogPageview />
          </Suspense>
          <GlobalProviders>{children}</GlobalProviders>
        </PostHogProvider>
        <Analytics />
        <AxiomWebVitals />
        <UTM />
        {env.NEXT_PUBLIC_GTM_ID ? (
          <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />
        ) : null}
      </body>
    </html>
  );
}
