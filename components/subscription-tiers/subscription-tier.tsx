import { SubscriptionTierType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

export const SubscriptionTier = ({ tier }: { tier: SubscriptionTierType }) => {
  const currentUser = useCurrentUser();
  const isCurrentTier = currentUser?.plan === tier.id;

  return (
    <div
      className={cn(
        "flex flex-col p-5 shadow-lg rounded-lg justify-between border bg-primary/5",
        tier.featured ? "relative border-purple-500" : "border-secondary",
        isCurrentTier && "relative",
      )}
    >
      {tier.featured && !isCurrentTier && (
        <div className="px-2 py-[3px] text-sm sm:text-xs text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          Popular
        </div>
      )}
      {isCurrentTier && (
        <div className="px-2 py-[3px] text-sm sm:text-xs bg-secondary rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
      {!tier.id.includes("FREE") && (
        <div className="mt-6">
          {currentUser?.plan === tier.id ? (
            <Button variant={"outline"} className="w-full">
              Manage
            </Button>
          ) : (
            <Button className="w-full text-sm">Switch</Button>
          )}
        </div>
      )}
    </div>
  );
};
