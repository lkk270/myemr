import { SubscriptionTierType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { planNames } from "@/lib/constants";
import axios from "axios";
import { useIsLoading } from "@/hooks/use-is-loading";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFolderStore } from "@/app/(platform)/(patient)/(file-system)/_components/hooks/use-folders";

export const SubscriptionTier = ({ tier }: { tier: SubscriptionTierType }) => {
  const { update } = useSession();
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const { isLoading, setIsLoading } = useIsLoading();
  const isCurrentTier = currentUser?.plan === tier.id;
  const { updateRestrictedStatus } = useFolderStore();
  const tierIsUpgrade = currentUser && planNames[tier.id].stripe.price > planNames[currentUser.plan].stripe.price;

  const onClick = async (forSubscriptionChange: boolean) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe", {
        redirectUrl: pathname,
        plan: tier.id,
      });
      if (!currentUser?.plan.includes("FREE") && forSubscriptionChange) {
        if (tierIsUpgrade && pathname.startsWith("/file")) {
          const newlyUnrestrictedFileIds = response.data.newlyUnrestrictedFileIds;
          updateRestrictedStatus(newlyUnrestrictedFileIds, false);
        } else if (!tierIsUpgrade && pathname.startsWith("/file")) {
          const newlyRestrictedFileIds = response.data.newlyRestrictedFileIds;
          updateRestrictedStatus(newlyRestrictedFileIds, true);
        }
        toast.success("Subscription successfully changed!");
      } else {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      await update();
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col p-5 shadow-lg rounded-lg justify-between border bg-primary/5",
        tier.featured && !isCurrentTier && tierIsUpgrade ? "relative border-purple-500" : "border-secondary",
        isCurrentTier && "border-[0.1px] relative border-green-500",
      )}
    >
      {tier.featured && !isCurrentTier && (
        <div className="px-2 py-[3px] text-sm sm:text-xs text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          Popular
        </div>
      )}
      {isCurrentTier && (
        <div className="border border-green-500 px-2 py-[3px] text-sm sm:text-xs bg-secondary rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          Current
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-center">{tier.title}</h3>
        <div className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-xl font-bold">{tier.priceText}</span>
          {tier.priceText !== "Free" && "/ month"}
        </div>
        <ul className="mt-4 space-y-2">
          {tier.items.map((item, index) => {
            return (
              <li className="flex items-center text-sm sm:text-xs" key={tier.id + index}>
                <Check className="bg-green-500 text-white flex-shrink-0 w-5 h-5 rounded-full mr-3 p-[2px]" />
                {item}
              </li>
            );
          })}
        </ul>
      </div>
      {currentUser?.plan && !tier.id.includes("FREE") && (
        <div className="mt-6">
          {currentUser?.plan === tier.id ? (
            <Button disabled={isLoading} onClick={() => onClick(false)} variant={"outline"} className="w-full">
              Manage
            </Button>
          ) : (
            <Button disabled={isLoading} className="w-full text-sm" onClick={() => onClick(true)}>
              {tierIsUpgrade ? "Upgrade" : "Downgrade"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
