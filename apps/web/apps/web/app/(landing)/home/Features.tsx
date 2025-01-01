"use client";

import {
  useLandingPageAIAssistantVariant,
  type LandingPageAIAssistantVariant,
} from "@/hooks/useFeatureFlags";
import clsx from "clsx";
import {
  BarChart2Icon,
  EyeIcon,
  LineChart,
  type LucideIcon,
  MousePointer2Icon,
  Orbit,
  ShieldHalfIcon,
  Sparkles,
  SparklesIcon,
  TagIcon,
  BlocksIcon,
  ListStartIcon,
} from "lucide-react";
import Image from "next/image";

export function FeaturesPrivacy() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-cal text-base leading-7 text-blue-600">
            Privacy first
          </h2>
          <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-4xl">
            Approved by Google. See exactly what our code does. Or host it
            yourself.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Mailto Live has undergone a thorough security process with Google to
            ensure the protection of your emails.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesWithImage(props: {
  imageSide: "left" | "right";
  title: string;
  subtitle: string;
  description: React.ReactNode;
  image: string;
  features: {
    name: string;
    description: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div
            className={clsx(
              "lg:pt-4",
              props.imageSide === "left"
                ? "lg:ml-auto lg:pl-4"
                : "lg:mr-auto lg:pr-4",
            )}
          >
            <div className="lg:max-w-lg">
              <h2 className="font-cal text-base leading-7 text-blue-600">
                {props.title}
              </h2>
              <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-4xl">
                {props.subtitle}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.description}
              </p>
              {!!props.features.length && (
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  {props.features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <feature.icon
                          className="absolute left-1 top-1 h-5 w-5 text-blue-600"
                          aria-hidden="true"
                        />
                        {feature.name}
                      </dt>{" "}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
          <div
            className={clsx(
              "flex items-start",
              props.imageSide === "left"
                ? "justify-end lg:order-first"
                : "justify-start lg:order-last",
            )}
          >
            <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
              <Image
                src={props.image}
                alt="Product screenshot"
                className="w-[48rem] max-w-none rounded-xl shadow-2xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                width={2400}
                height={1800}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesAiAssistant() {
  const variant = useLandingPageAIAssistantVariant();

  const variants: Record<
    LandingPageAIAssistantVariant,
    {
      title: string;
      subtitle: string;
      description: React.ReactNode;
      featuresAutomations: {
        name: string;
        description: string;
        icon: LucideIcon;
      }[];
    }
  > = {
    control: {
      title: "Automate your inbox",
      subtitle: "Your AI assistant for email",
      description:
        "Transform your inbox from chaos to clarity. Let AI handle the predictable, while you focus on what matters.",
      featuresAutomations: [
        {
          name: "Automate your replies",
          description:
            "Set custom rules and let AI draft perfect responses to common emails - from meeting requests to customer inquiries.",
          icon: Sparkles,
        },
        {
          name: "Intelligent organization",
          description:
            "Automatically sort, label, and prioritize emails based on your preferences and workflow.",
          icon: Orbit,
        },
        {
          name: "Natural instructions",
          description:
            "No coding needed - just tell your assistant what you want in plain English, like you would a team member.",
          icon: LineChart,
        },
      ],
    },
    magic: {
      title: "Your Personal Assistant",
      subtitle: "Your AI Email Assistant That Works Like Magic",
      description: (
        <>
          All the benefits of a personal assistant, at a fraction of the cost.
          <br />
          <br />
          Tell your AI assistant how to manage your email in plain English -
          just like you would ChatGPT. Want newsletters archived and labeled?
          Investor emails flagged as important? Automatic reply drafts for
          common requests? Just ask.
          <br />
          <br />
          Once configured, your assistant works 24/7 to keep your inbox
          organized exactly how you want it. No more drowning in email. No
          expensive human assistant required.
        </>
      ),
      featuresAutomations: [],
    },
  };

  const selectedVariant =
    typeof variant === "string" ? variants[variant] : variants.control;

  return (
    <FeaturesWithImage
      imageSide="left"
      title={selectedVariant.title}
      subtitle={selectedVariant.subtitle}
      description={selectedVariant.description}
      features={selectedVariant.featuresAutomations}
      image="/images/ai-automation.png"
    />
  );
}

const featuresColdEmailBlocker = [
  {
    name: "Block out the noise",
    description:
      "Automatically archive or label cold emails. Keep your inbox clean and focused on what matters.",
    icon: ShieldHalfIcon,
  },
  {
    name: "Adjust cold email prompt",
    description:
      "Tell Mailto Live what constitutes a cold email for you. It will block them based on your instructions.",
    icon: SparklesIcon,
  },
  {
    name: "Label cold emails",
    description:
      "Automatically label cold emails so you can review them later. Keep your inbox clean and focused on what matters.",
    icon: TagIcon,
  },
];

export function FeaturesColdEmailBlocker() {
  const subtitle = "Keep salespeople at the gate";
  const description =
    "Say goodbye to unsolicited outreach. Automatically filter sales pitches and cold emails so you only see messages that matter.";

  return (
    <FeaturesWithImage
      imageSide="left"
      title="Cold Email Blocker"
      subtitle={subtitle}
      description={description}
      image="/images/cold-email-blocker.png"
      features={featuresColdEmailBlocker}
    />
  );
}

const featuresStats = [
  {
    name: "Who emails you most",
    description:
      "Someone emailing you too much? Figure out a plan to handle this better.",
    icon: Sparkles,
  },
  {
    name: "Who you email most",
    description:
      "If there's one person you're constantly speaking to is there a better way for you to speak?",
    icon: Orbit,
  },
  {
    name: "What type of emails you get",
    description:
      "Getting a lot of newsletters or cold emails? Try automatically archiving and labelling them with our AI.",
    icon: LineChart,
  },
];

export function FeaturesStats() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Inbox Analytics"
      subtitle="Understand your inbox"
      description="Understanding your inbox is the first step to dealing with it. Understand what is filling up your inbox. Then figure out an action plan to deal with it."
      image="/images/analytics.png"
      features={featuresStats}
    />
  );
}

const featuresUnsubscribe = [
  {
    name: "One-click unsubscribe",
    description:
      "Don't search for the unsubscribe button. Unsubscribe in a click, or auto archive instead.",
    icon: MousePointer2Icon,
  },
  {
    name: "See who emails you most",
    description:
      "See who's sending you the most marketing emails to prioritise who to unsubscribe from.",
    icon: EyeIcon,
  },
  {
    name: "How often you read them",
    description:
      "See what percentage of emails you read from each sender. Unsubscribe from the ones you don't read.",
    icon: BarChart2Icon,
  },
];

export function FeaturesUnsubscribe() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Bulk Email Unsubscriber"
      subtitle="No more newsletters you never read"
      description="Bulk unsubscribe from emails in one click. View all your subscriptions and how often you read each one."
      image="/images/newsletters.png"
      features={featuresUnsubscribe}
    />
  );
}

export function FeaturesHome() {
  return (
    <>
      <FeaturesAiAssistant />
      <FeaturesUnsubscribe />
      <FeaturesColdEmailBlocker />
      <FeaturesStats />
    </>
  );
}

const featuresNewSenders = [
  {
    name: "Quickly Identify New Senders",
    description:
      "Conveniently lists all new individuals or entities that recently emailed you, helping you spot important contacts.",
    icon: EyeIcon,
  },
  {
    name: "Effortless Blocking",
    description:
      "Easily block any unwanted sender with a single click, keeping your inbox clean and relevant.",
    icon: ShieldHalfIcon,
  },
  {
    name: "Stay Organized and Secure",
    description:
      "Enhance your email security by managing unfamiliar senders, reducing the risk of spam and phishing attacks.",
    icon: BlocksIcon,
  },
  {
    name: "Personalize Your Email Experience",
    description:
      "Discover and prioritize important emails, ensuring you never miss out on significant introductions or opportunities.",
    icon: ListStartIcon,
  },
];

export function FeaturesNewSenders() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="New Sender List"
      subtitle="Manage new senders in your inbox"
      description="View a comprehensive list of recent new senders, making it easier to spot important contacts and opportunities, while also offering the ability to block unwanted communication effortlessly."
      image="/images/newsletters.png"
      features={featuresNewSenders}
    />
  );
}
