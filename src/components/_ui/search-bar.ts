import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "h-[30px] gap-1.5 px-2.5 text-[12px]",
  md: "h-9 gap-2 px-3 text-[13px]",
};

export function searchBarClassName(
  size: keyof typeof SIZE_CLASS = "md",
  className?: string,
) {
  return cn(
    "border-line-strong bg-secondary focus-within:border-ring flex min-w-0 items-center rounded-full border transition-[border-color] duration-150 ease-power3-out",
    SIZE_CLASS[size],
    className,
  );
}
