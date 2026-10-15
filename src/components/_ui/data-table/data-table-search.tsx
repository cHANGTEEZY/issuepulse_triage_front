"use client";

import { useEffect, useId, useState, type ComponentProps } from "react";
import { searchBarClassName } from "@/components/_ui/search-bar";
import { useDeferredCallback } from "@/hooks/use-deferred-callback";
import { cn } from "@/lib/utils";
import SearchIcon from "@/public/assets/images/_common/search.svg?react";
import XIcon from "@/public/assets/images/companies/detail/x.svg?react";

export const TABLE_SEARCH_DEBOUNCE_MS = 300;

type DataTableSearchProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type" | "placeholder" | "size"
> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  debounce?: boolean;
  debounceMs?: number;
  throttle?: boolean;
  throttleMs?: number;
};

export default function DataTableSearch({
  value,
  onValueChange,
  placeholder = "Search…",
  size = "sm",
  debounce = true,
  debounceMs = TABLE_SEARCH_DEBOUNCE_MS,
  throttle = false,
  throttleMs = 200,
  id,
  className,
  name = "search",
  ...props
}: DataTableSearchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [query, setQuery] = useState(value);

  const emit = useDeferredCallback(onValueChange, {
    debounceMs: debounce ? debounceMs : 0,
    throttleMs: throttle ? throttleMs : 0,
  });

  useEffect(() => {
    if (value === "") setQuery("");
  }, [value]);

  function update(next: string) {
    setQuery(next);
    emit(next);
  }

  return (
    <div className={cn(searchBarClassName(size), className)}>
      <SearchIcon aria-hidden className="text-subtle size-3.5 shrink-0" />
      <input
        {...props}
        id={inputId}
        name={name}
        type="search"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => update(event.target.value)}
        className="placeholder:text-subtle h-full min-w-0 flex-1 bg-transparent text-inherit leading-none text-foreground outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => update("")}
          className="text-subtle hover:text-foreground flex size-4 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <XIcon aria-hidden className="size-3" />
        </button>
      )}
    </div>
  );
}
