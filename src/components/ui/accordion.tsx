"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue>({});

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(
  undefined
);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      collapsible = false,
      value,
      onValueChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>("");

    const currentValue = value ?? internalValue;

    const handleValueChange = (newValue: string) => {
      if (type === "single") {
        if (collapsible && currentValue === newValue) {
          setInternalValue("");
          onValueChange?.("");
        } else {
          setInternalValue(newValue);
          onValueChange?.(newValue);
        }
      }
    };

    return (
      <AccordionContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className, ...props }, ref) => {
  const context = React.useContext(AccordionContext);
  const itemValue = React.useContext(AccordionItemContext)?.value || "";
  const isOpen = context.value === itemValue;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.onValueChange?.(itemValue)}
      className={cn(
        "flex w-full items-center justify-between py-2 font-medium transition-colors",
        "hover:opacity-80",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, ...props }, ref) => {
  const context = React.useContext(AccordionContext);
  const itemValue = React.useContext(AccordionItemContext)?.value || "";
  const isOpen = context.value === itemValue;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-96" : "max-h-0"
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";
