"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useSearch } from "@/app/(platform)/(patient)/(file-system)/_components/hooks/use-search";

export const SearchBox = () => {
  const search = useSearch();
  const isMobile = useMediaQuery("(max-width: 450px)");
  return isMobile ? (
    <div>
      <div onClick={search.onOpen} role="button" className="h-full rounded-sm mr-1">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground/50" />
      </div>
    </div>
  ) : (
    <div
      onClick={search.onOpen}
      role="button"
      className={cn(
        "hover:bg-primary/10 rounded-md px-2 min-w-[125px] xs:min-w-[200px] sm:xs:min-w-[300px] group cursor-pointer min-h-[40px] text-sm py-1 pr-3 w-full bg-primary/5 flex items-center text-muted-foreground font-medium",
      )}
    >
      <div role="button" className="h-full rounded-sm  mr-1">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      </div>

      <span className="truncate">Search</span>

      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
};
