import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Chargement...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground", className)}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
