"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "primary";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[#1f2b6c] text-white hover:bg-[#27358a] focus-visible:ring-[#4c6ef5]",
  primary:
    "bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#4c6ef5] text-white shadow-lg shadow-indigo-200/60 hover:from-[#6d28d9] hover:via-[#4c6ef5] hover:to-[#2563eb] focus-visible:ring-[#7c3aed]",
  outline:
    "border border-violet-200/70 bg-[#f7f4ff] text-[#2e2a5c] hover:bg-[#ede9ff] focus-visible:ring-violet-200",
  ghost:
    "text-[#433b8f] hover:bg-indigo-50 focus-visible:ring-transparent focus-visible:ring-offset-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      type = "button",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.99]",
          variantStyles[variant],
          sizeStyles[size],
          isLoading && "cursor-progress opacity-80",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
