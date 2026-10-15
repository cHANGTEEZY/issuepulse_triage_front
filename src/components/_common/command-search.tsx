"use client";

import Button from "@/components/_ui/button";
import { Kbd } from "@/components/_ui/command";
import { searchBarClassName } from "@/components/_ui/search-bar";
import { useUiStore } from "@/features/app/stores/ui-store";
import { cn } from "@/lib/utils";
import SearchIcon from "@/public/assets/images/_common/search.svg?react";

type CommandSearchProps = {
  placeholder?: string;
  className?: string;
};

export default function CommandSearch({
  placeholder = "Search…",
  className,
}: CommandSearchProps) {
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

  function open() {
    setSearchOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          searchBarClassName(
            "md",
            "hover:border-ring max-sm:hidden min-w-0 cursor-pointer text-left outline-none sm:max-w-[20em] sm:flex-1 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60",
          ),
          className,
        )}
      >
        <SearchIcon aria-hidden className="text-subtle size-3.5 shrink-0" />
        <span className="text-subtle min-w-0 flex-1 truncate">
          {placeholder}
        </span>
        <Kbd className="shrink-0">⌘K</Kbd>
      </button>
      <Button
        variant="secondary"
        size="icon"
        className="sm:hidden"
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={open}
      >
        <SearchIcon aria-hidden className="size-3.5" />
      </Button>
    </>
  );
}
