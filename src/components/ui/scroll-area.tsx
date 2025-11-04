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
  const resolvedStyle =
    height === "auto" ? style : { maxHeight: height, ...style };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/60 bg-[#fdfbff]",
        className,
      )}
      style={resolvedStyle}
      {...props}
    >
      <div className="h-full overflow-y-auto pr-1">{children}</div>
    </div>
  );
}
