"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { completedAppOnboardingAction } from "@/utils/actions/user";
import { env } from "@/env";
import { appHomePath } from "@/utils/config";
import { usePremium } from "@/components/PremiumAlert";

export const OnboardingFinish = () => {
  const { isPremium } = usePremium();

  function getHref() {
    if (isPremium) return appHomePath;
    return env.NEXT_PUBLIC_WELCOME_UPGRADE_ENABLED
      ? "/welcome-upgrade"
      : appHomePath;
  }

  const handleComplete = () => {
    completedAppOnboardingAction();
    // Redirect to /automation after completing onboarding
    window.location.href = "/automation";
  };

  return <Button onClick={handleComplete}>Continue</Button>;
};
