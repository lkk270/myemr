import { SubscriptionTierType } from "@/app/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SubscriptionTier = ({ tier }: { tier: SubscriptionTierType }) => {
  return (
    <div
      className={cn(
        "md:h-[500px] flex flex-col p-5 shadow-lg rounded-lg justify-between border bg-primary/5 shadow-secondary",
        tier.featured ? "relative border-purple-500" : "border-primary/20",
      )}
    >
      {tier.featured && (
        <div className="px-2 py-[3px] text-sm sm:text-xs text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          Popular
        </div>
      )}

      <div>
        <h3 className="text-3xl font-bold text-center">{tier.title}</h3>
        <div className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-2xl font-bold">{tier.priceText}</span>
          {tier.priceText !== "Free" && "/ month"}
        </div>
        {!!tier.description && <div className="pt-3 text-sm">{tier.description}</div>}
        <ul className="mt-6 md:mt-8 space-y-2 sm:space-y-3 md:space-y-4">
          {tier.items.map((item, index) => {
            return (
              <li className="text-md flex items-center" key={tier.id + index}>
                <Check className="bg-green-500 text-white flex-shrink-0 w-5 h-5 rounded-full mr-3 p-[2px]" />
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
