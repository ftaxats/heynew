import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/app/(landing)/home/Hero";
import { Testimonials } from "@/app/(landing)/home/Testimonials";
import { Pricing } from "@/app/(app)/premium/Pricing";
import { FAQs } from "@/app/(landing)/home/FAQs";
import { CTA } from "@/app/(landing)/home/CTA";
import { FeaturesStats } from "@/app/(landing)/home/Features";
import { BasicLayout } from "@/components/layouts/BasicLayout";

export const metadata: Metadata = {
  title: "Boost Productivity with AI Email Analytics | MailtoLive",
  description:
    "Unlock the power of AI to transform your email management. Discover insights, enhance productivity, and achieve inbox zero with MailtoLive's AI-driven email analytics.",
  alternates: { canonical: "/email-analytics" },
  keywords: [
    "AI email analytics",
    "email management software",
    "inbox zero method",
    "Gmail automation",
    "email productivity",
  ],
  openGraph: {
    title: "Boost Productivity with AI Email Analytics | MailtoLive",
    description:
      "Unlock the power of AI to transform your email management. Discover insights, enhance productivity, and achieve inbox zero with MailtoLive's AI-driven email analytics.",
    url: "https://mailto.live/email-analytics",
    images: [
      {
        url: "/images/analytics.png",
        width: 1200,
        height: 630,
        alt: "Email Analytics Dashboard",
      },
    ],
  },
};

export default function EmailAnalytics() {
  return (
    <BasicLayout>
      <Hero
        title="Understand Your Inbox with AI Email Analytics"
        subtitle="Maximize your email management efficiency by gaining insights into your email patterns and improving productivity."
        image="/images/analytics.png"
      />
      <Testimonials />
      <FeaturesStats />
      <Suspense>
        <div className="pb-32">
          <Pricing />
        </div>
      </Suspense>
      <FAQs />
      <CTA />
    </BasicLayout>
  );
}
