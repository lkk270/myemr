import { Loader, Loader2, RefreshCw } from "lucide-react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("text-muted-foreground animate-spin", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-2 w-2",
      lg: "h-6 w-6",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  loaderType?: "loader" | "loader2" | "refresh";
  className?: string;
}

export const Spinner = ({ size, loaderType = "loader", className = "" }: SpinnerProps) => {
  const Icon = loaderType === "loader" ? Loader : loaderType === "loader2" ? Loader2 : RefreshCw;
  return <Icon className={cn(spinnerVariants({ size }), className)} />;
};
