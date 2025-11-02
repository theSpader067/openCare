import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "success" | "warning" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  outline: "border border-input",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      variants[variant],
      className
    )}
    {...props}
  />
);
