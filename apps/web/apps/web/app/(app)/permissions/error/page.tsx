"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logOut } from "@/utils/user";
import { PageHeading, TypographyP } from "@/components/Typography";

export default function PermissionsErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center sm:p-20 md:p-32">
      <PageHeading className="text-center">
        You are missing permissions 😔
      </PageHeading>

      <TypographyP className="mx-auto mt-4 max-w-prose text-center">
        You must sign in and give access to all permissions for Mailto Live to
        work.
      </TypographyP>

      <Button className="mt-4" onClick={() => logOut("/login")}>
        Sign in again
      </Button>

      <div className="mt-8">
        <Image
          src="/images/falling.svg"
          alt=""
          width={400}
          height={400}
          unoptimized
        />
      </div>
    </div>
  );
}
