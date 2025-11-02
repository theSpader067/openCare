import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
}

export const Avatar = ({ initials, className, ...props }: AvatarProps) => (
  <div
    className={cn(
      "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
      className
    )}
    {...props}
  >
    {initials}
  </div>
);
