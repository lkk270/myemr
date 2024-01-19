"use client";

import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
  FolderClosed,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { useUser } from "@clerk/clerk-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemProps {
  isFile?: boolean;
  id?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
}

export const Item = ({
  isFile = false,
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
}: ItemProps) => {
  // const { user } = useUser();
  const router = useRouter();

  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // event.stopPropagation();
    // if (!id) return;
    // const promise = archive({ id }).then(() => router.push("/documents"));
    // toast.promise(promise, {
    //   loading: "Moving to trash...",
    //   success: "Note moved to trash!",
    //   error: "Failed to archive note.",
    // });
  };

  const handleExpand = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    // if (!id) return;
    // const promise = create({ title: "Untitled", parentDocument: id }).then((documentId) => {
    //   if (!expanded) {
    //     onExpand?.();
    //   }
    //   router.push(`/documents/${documentId}`);
    // });

    // toast.promise(promise, {
    //   loading: "Creating a new note...",
    //   success: "New note created!",
    //   error: "Failed to create a new note.",
    // });
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;
  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        paddingLeft: level ? (isFile ? `${level * 12 + 12 + 4 + 16}px` : `${level * 12 + 12}px`) : "12px",
      }}
      className={cn(
        "group cursor-grab min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary",
      )}
    >
      {!!id && !isFile && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          onClick={handleExpand}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}
      <span className="truncate">{label}</span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </div>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
};
