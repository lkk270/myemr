"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Header } from "./header";
import { Social } from "./social";
import { BackButton } from "./back-button";
import { useShowTwoFactor } from "@/auth/hooks/use-show-two-factor";
import { UserType } from "@prisma/client";
interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel?: string;
  headerSubtitle?: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  headerSubtitle,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  const { showTwoFactor } = useShowTwoFactor();
  return (
    <Card className="shadow-md">
      {!!headerLabel && (
        <CardHeader>
          <Header label={headerLabel} />
          {!!headerSubtitle && <div className="text-sm text-muted-foreground text-center">{headerSubtitle}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {showSocial && !showTwoFactor && (
        <CardFooter className="flex flex-col items-center justify-center">
          <div style={{ marginBottom: "10px" }} className="flex items-center w-full">
            <span className="flex-grow border-t border-primary/5"></span>
            <span className="mx-2 text-sm text-muted-foreground">or</span>
            <span className="flex-grow border-t border-primary/5"></span>
          </div>
          <Social userType={backButtonHref.includes("patient") ? UserType.PATIENT : UserType.PROVIDER} />
        </CardFooter>
      )}
      {!showTwoFactor && (
        <CardFooter className="flex flex-col gap-y-3">
          <BackButton label={backButtonLabel} href={backButtonHref} />
          {!!headerLabel && headerLabel.includes("Create") && (
            <div className="text-xs text-muted-foreground pb-28 sm:pb-0">
              By creating an account you agree to be bounded by these{" "}
              <a target="_blank" href="/terms" className="underline">
                terms
              </a>
              .
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
