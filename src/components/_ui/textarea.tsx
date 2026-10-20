import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-line-strong bg-secondary text-foreground placeholder:text-subtle focus-visible:border-ring ease-power3-out min-h-24 w-full min-w-0 rounded-lg border px-3 py-2 text-[14px] leading-[1.45] outline-none transition-[border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
