import { SubscriptionTier } from "./subscription-tier";
import { SubscriptionTierType } from "@/app/types";

const tiers: SubscriptionTierType[] = [
  {
    id: "PATIENT_FREE",
    title: "Basic",
    priceText: "Free",
    stripePrice: 0,
    featured: false,
    description: `Ideal for new users digitizing health records. Offers 1 GB storage, files up to 10 Mb, 2 request records per month, and unlimited "Read Only" & "Upload File Only" access codes.`,
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
    description: `For patients needing more storage and flexibility. Includes 10 GB storage, 5 GB file size limit, 10 request records per month, and unlimited access codes of all types.`,
    priceText: "$5",
    stripePrice: 500,
    featured: true,
    items: [
      "10 GB of file storage",
      "5 GB max file size",
      "10 request records per month",
      `Generate unlimited access codes of ALL types`,
    ],
  },
  {
    id: "PATIENT_PREMIUM_2",
    title: "Pro+",
    description: `Best for managing extensive health records. Provides 50 GB storage, 5 GB file size, unlimited request records, and unlimited access codes of all types.`,
    priceText: "$12",
    stripePrice: 1200,
    featured: false,
    items: [
      "50 GB of file storage",
      "5 GB max file size",
      "Unlimited request records per month",
      `Generate unlimited access codes of ALL types`,
    ],
  },
];
export const PatientSubscriptionTiers = () => {
  return (
    <div className="flex flex-col items-center pt-12">
      <h1 className="font-bold pb-5 sm:pb-10 text-xl md:text-3xl">Patient Pricing</h1>
      <div className="max-w-[1000px] w-full px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-2 md:grid-cols-3">
        {tiers.map((tier, index) => {
          return <SubscriptionTier tier={tier} key={tier.id} />;
        })}
      </div>
    </div>
  );
};
