import type { ComponentProps, ReactNode } from "react";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import { cn } from "@/lib/utils";

type AuthFieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  trailing?: ReactNode;
  action?: ReactNode;
};

export default function AuthField({
  id,
  label,
  error,
  trailing,
  action,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <Field label={label} htmlFor={id ?? ""} error={error} trailing={trailing}>
      <div className="relative">
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn("h-11", action && "pr-10", className)}
          {...props}
        />
        {action ? (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {action}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
