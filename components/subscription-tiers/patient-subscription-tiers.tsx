import { Button } from "@/components/ui/button";
import { JSX, SVGProps } from "react";
import { SubscriptionTier } from "./subscription-tier";
import { SubscriptionTierType } from "@/app/types";

const tiers: SubscriptionTierType[] = [
  {
    id: "PATIENT_FREE",
    title: "Basic",
    priceText: "Free",
    featured: false,
    items: [
      "1 GB of file storage",
      "10 Mb max file size",
      "2 request records per month",
      `Generate unlimited "Read Only" & "Upload File Only" access codes`,
    ],
  },
  {
    id: "PATIENT_PREMIUM_1",
    title: "Pro",
    priceText: "$5",
    featured: true,
    items: [
      "10 GB of file storage",
      "No max file size",
      "10 request records per month",
      `Generate unlimited access codes of ALL types`,
    ],
  },
  {
    id: "PATIENT_PREMIUM_2",
    title: "Pro+",
    priceText: "$12",
    featured: false,
    items: [
      "50 GB of file storage",
      "No max file size",
      "Unlimited request records per month",
      `Generate unlimited access codes of ALL types`,
    ],
  },
];
export const PatientSubscriptionTiers = () => {
  return (
    <div className="grid grid-cols-1 pb-6 gap-6 sm:gap-2 sm:grid-cols-3 sm:pb-0">
      {tiers.map((tier, index) => {
        return <SubscriptionTier tier={tier} key={tier.id} />;
      })}
    </div>
  );
};
