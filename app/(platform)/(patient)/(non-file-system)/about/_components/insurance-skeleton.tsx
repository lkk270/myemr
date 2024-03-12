import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
export const InsuranceSkeleton = ({ pulse = false }: { pulse?: boolean }) => {
  return (
    <div
      className={cn(
        "border border-dashed border-gray-200/50 rounded-lg flex items-center justify-center relative overflow-hidden",
        pulse && "animate-pulse",
      )}
    >
      <Skeleton className="h-[300px] w-[300px] rounded-lg" />
      <div className="bg-gray-200 h-full opacity-50 top-0 w-full z-10 absolute" />
      <div className="absolute flex items-center justify-center">
        <div className="h-[200px] w-[200px] border-4 border-gray-400 border-dashed rounded-lg" />
      </div>
    </div>
  );
};
