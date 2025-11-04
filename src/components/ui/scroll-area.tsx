"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
}

export function ScrollArea({
  className,
  height = "auto",
  style,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/60 bg-[#fdfbff]",
        className,
      )}
      style={{ maxHeight: height, ...style }}
      {...props}
    >
      <div className="h-full overflow-y-auto pr-1">{children}</div>
    </div>
  );
}
