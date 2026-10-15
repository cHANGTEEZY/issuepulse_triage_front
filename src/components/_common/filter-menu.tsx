"use client";

import { DropdownMenu } from "@/components/arc/dropdown-menu/dropdown-menu";

export type FilterOption = { value: string; label: string };

type FilterMenuProps = {
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  align?: "start" | "end";
  className?: string;
};

export default function FilterMenu({
  label,
  value,
  options,
  onChange,
  align = "start",
  className,
}: FilterMenuProps) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu
      prefix={label}
      label={current?.label ?? value}
      align={align}
      className={className}
      items={options.map((option) => ({
        label: option.label,
        selected: option.value === value,
        onSelect: () => onChange(option.value),
      }))}
    />
  );
}
