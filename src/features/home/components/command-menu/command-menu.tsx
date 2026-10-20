"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Kbd,
} from "@/components/_ui/command";
import { useUiStore } from "@/features/app/stores/ui-store";
import { useIssueList } from "@/api/hooks/use-issues";

export default function CommandMenu() {
  const navigate = useNavigate();
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState("");
  const actionRan = useRef(false);
  const issues = useIssueList({ search: query }, open);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      const { searchOpen, setSearchOpen } = useUiStore.getState();
      setSearchOpen(!searchOpen);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function go(action: () => void) {
    actionRan.current = true;
    setOpen(false);
    action();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search issues by title or body"
      className="max-w-[640px]"
      onCloseAutoFocus={(event) => {
        if (actionRan.current) event.preventDefault();
        actionRan.current = false;
        setQuery("");
      }}
    >
      <Command>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search issues…"
          trailing={<Kbd>Esc</Kbd>}
        />
        <CommandList>
          <CommandEmpty>
            {issues.isPending ? "Searching…" : `No results for “${query}”`}
          </CommandEmpty>
          <CommandGroup heading="Issues">
            {(issues.data ?? []).map((issue) => (
              <CommandItem
                key={issue.id}
                value={`${issue.number} ${issue.title} ${issue.repository.owner}/${issue.repository.name}`}
                onSelect={() =>
                  go(() => {
                    void navigate({
                      to: "/issues/$issueId",
                      params: { issueId: issue.id },
                    });
                  })
                }
              >
                <span className="min-w-0 flex-1 truncate">
                  #{issue.number} {issue.title}
                </span>
                <span className="caption-style text-subtle shrink-0">
                  {issue.repository.name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Go to">
            <CommandItem
              value="issues"
              onSelect={() => go(() => void navigate({ to: "/" }))}
            >
              Issues
            </CommandItem>
            <CommandItem
              value="repositories"
              onSelect={() => go(() => void navigate({ to: "/repositories" }))}
            >
              Repositories
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Open
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
