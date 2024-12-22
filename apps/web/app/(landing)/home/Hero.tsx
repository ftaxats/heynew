import { CTAButtons } from "@/app/(landing)/home/CTAButtons";
import { SquaresPattern } from "@/app/(landing)/home/SquaresPattern";
import { cn } from "@/utils";
import { LogoCloud } from "@/app/(landing)/home/LogoCloud";
import { env } from "@/env";
import { HeroAB } from "@/app/(landing)/home/HeroAB";
import HeroVideoDialog from "@/components/HeroVideoDialog";

export function HeroText(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const { className, ...rest } = props;

  return (
    <h1
      className={cn("font-cal text-4xl text-gray-900 sm:text-6xl", className)}
      {...rest}
    />
  );
}

export function HeroSubtitle(props: { children: React.ReactNode }) {
  return <p className="mt-6 text-lg leading-8 text-gray-600" {...props} />;
}

export function HeroHome() {
  if (env.NEXT_PUBLIC_POSTHOG_HERO_AB)
    return <HeroAB variantKey={env.NEXT_PUBLIC_POSTHOG_HERO_AB} />;
  return <Hero />;
}

export function Hero(props: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
}) {
  return (
    <div className="relative pt-14">
      <SquaresPattern />
      <div className="pt-24 sm:pb-12 sm:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <ProductHuntBadge />
          </div>

          <div className="mx-auto max-w-xl text-center">
            <HeroText>
              {props.title || "Stop wasting half your day in Gmail"}
            </HeroText>
            <HeroSubtitle>
              {props.subtitle ||
                "Automate your email with AI, bulk unsubscribe from newsletters, and block cold emails. Open-source."}
            </HeroSubtitle>
            <CTAButtons />
          </div>

          <LogoCloud />

          <div className="relative mt-16 flow-root sm:mt-24">
            <HeroVideoDialog
              className="block"
              animationStyle="top-in-bottom-out"
              videoSrc="https://www.youtube.com/embed/hfvKvTHBjG0?autoplay=1"
              thumbnailSrc={props.image || "/images/newsletters.png"}
              thumbnailAlt="Bulk Unsubscriber Screenshot"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductHuntBadge() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
      <a
        href="https://www.producthunt.com/posts/mailto-live?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-mailto&#0045;live"
        target="_blank"
        rel="noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=727877&theme=light"
          alt="Mailto Live - AI Email Management & Gmail Cleanup Tool | Product Hunt"
          className="h-[54px] w-[250px]"
          width="250"
          height="54"
        />
      </a>
    </div>
  );
}
