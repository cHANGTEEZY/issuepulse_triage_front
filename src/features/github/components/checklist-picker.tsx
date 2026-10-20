import { useMemo, useState, type ReactNode } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import { Input } from "@/components/_ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/_ui/popover";

export type PickerOption = {
  value: string;
  label: string;
  hint?: string | null;
  leading?: ReactNode;
};

type ChecklistPickerProps = {
  label: string;
  options: PickerOption[];
  selected: string[];
  max?: number;
  loading?: boolean;
  disabled?: boolean;
  emptyLabel: string;
  onApply: (values: string[]) => void;
};

function same(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
}

export default function ChecklistPicker({
  label,
  options,
  selected,
  max,
  loading,
  disabled,
  emptyLabel,
  onApply,
}: ChecklistPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
  }, [options, query]);

  function toggle(value: string, checked: boolean) {
    setDraft((current) => {
      if (!checked) return current.filter((item) => item !== value);
      if (max && current.length >= max) return current;
      return [...current, value];
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft(selected);
          setQuery("");
        } else if (!same(draft, selected)) {
          onApply(draft);
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={`Edit ${label.toLowerCase()}`}
        >
          Edit
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-[18em] flex-col" align="end">
        <div className="border-line-strong border-b p-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Filter ${label.toLowerCase()}`}
            aria-label={`Filter ${label.toLowerCase()}`}
            className="h-8"
          />
        </div>
        <ul className="flex max-h-[16em] flex-col overflow-y-auto p-1">
          {loading && <li className="text-subtle px-2 py-2">Loading…</li>}
          {!loading && visible.length === 0 && (
            <li className="text-subtle px-2 py-2">{emptyLabel}</li>
          )}
          {visible.map((option) => {
            const checked = draft.includes(option.value);
            const id = `pick-${label}-${option.value}`;
            return (
              <li key={option.value}>
                <label
                  htmlFor={id}
                  className="hover:bg-foreground/4 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggle(option.value, value === true)
                    }
                  />
                  {option.leading}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{option.label}</span>
                    {option.hint && (
                      <span className="caption-style text-subtle truncate">
                        {option.hint}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="caption-style text-subtle border-line-strong border-t px-3 py-2">
          {max ? `Up to ${max}. ` : ""}Changes save when you close this list.
        </p>
      </PopoverContent>
    </Popover>
  );
}
