import { PageHeading, TypographyP } from "@/components/Typography";
import { Steps } from "@/app/(app)/onboarding/Steps";
import { OnboardingBulkUnsubscriber } from "@/app/(app)/onboarding/OnboardingBulkUnsubscriber";
import { OnboardingColdEmailBlocker } from "@/app/(app)/onboarding/OnboardingColdEmailBlocker";
import { OnboardingAIEmailAssistant } from "@/app/(app)/onboarding/OnboardingEmailAssistant";
import { OnboardingFinish } from "@/app/(app)/onboarding/OnboardingFinish";
import { PermissionsCheck } from "@/app/(app)/PermissionsCheck";
import { LoadStats } from "@/providers/StatLoaderProvider";

export const maxDuration = 120;

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const step = searchParams.step
    ? Number.parseInt(searchParams.step)
    : undefined;

  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <PermissionsCheck />
      <LoadStats loadBefore showToast={false} />

      <div className="px-4 xl:px-0">
        <PageHeading>First steps to clean your inbox</PageHeading>
        <TypographyP>
          Get to know Mailto Live and set up your account.
        </TypographyP>
      </div>

      <div className="my-8">
        <Steps
          selectedStep={step}
          steps={[
            {
              title: "Bulk Unsubscriber",
              description: "One-click unsubscribe from emails you never read.",
              content: <OnboardingBulkUnsubscriber />,
              videoId: "123456789",
              active: !step || step === 1,
            },
            {
              title: "AI Personal Assistant",
              description:
                "The AI assistant helps you handle incoming emails. You tell it what to do in plain English in the file below. Try the example below or enter your own.",
              content: <OnboardingAIEmailAssistant step={2} />,
              videoId: "1234567890",
              active: step === 2,
            },
            {
              title: "Cold Emailer Blocker",
              description: "Block unsolicited sales emails",
              content: <OnboardingColdEmailBlocker step={3} />,
              active: step === 3,
            },
            {
              title: "Continue",
              description: "Get started with Mailto Live",
              content: <OnboardingFinish />,
              active: step === 4,
            },
          ]}
        />
      </div>
    </div>
  );
}
