import { useState } from "react";
import { Label } from "@/components/_ui/label";
import { cn } from "@/lib/utils";

type OtpFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

const LENGTH = 6;

export default function OtpField({
  id,
  value,
  onChange,
  error,
  disabled,
}: OtpFieldProps) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Verification code</Label>
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={LENGTH}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, "").slice(0, LENGTH))
          }
          className="absolute inset-0 z-10 cursor-text bg-transparent text-transparent caret-transparent"
        />
        <div aria-hidden className="pointer-events-none flex gap-2">
          {Array.from({ length: LENGTH }, (_, index) => (
            <span
              key={index}
              className={cn(
                "border-line-strong bg-secondary flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border text-[16px] leading-none font-medium",
                focused && index === activeIndex && "border-ring",
                error && "border-danger",
              )}
            >
              {value[index] ?? ""}
            </span>
          ))}
        </div>
      </div>
      {error ? (
        <span id={errorId} role="alert" className="caption-style text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
