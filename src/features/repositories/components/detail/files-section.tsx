import { Drawer } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import type { RepositoryEntry } from "@/api/repositories";
import Button from "@/components/_ui/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type FilesSectionProps = {
  entries: RepositoryEntry[];
  path: string;
  onNavigate: (path: string) => void;
};

export default function FilesSection({ entries, path, onNavigate }: FilesSectionProps) {
  const segments = path.split("/").filter(Boolean);
  const parent = segments.slice(0, -1).join("/");

  return (
    <div className="flex max-w-[56em] flex-col gap-3">
      <nav aria-label="Path" className="caption-style flex flex-wrap items-center gap-1">
        <Button variant="ghost" size="none" className="px-1 py-0.5 font-normal" onClick={() => onNavigate("")}>
          root
        </Button>
        {segments.map((segment, index) => {
          const target = segments.slice(0, index + 1).join("/");
          const last = index === segments.length - 1;
          return (
            <span key={target} className="flex items-center gap-1">
              <span aria-hidden className="text-subtle">
                /
              </span>
              {last ? (
                <span className="px-1 py-0.5 font-medium">{segment}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="none"
                  className="px-1 py-0.5 font-normal"
                  onClick={() => onNavigate(target)}
                >
                  {segment}
                </Button>
              )}
            </span>
          );
        })}
      </nav>

      <ul className="border-border flex flex-col rounded-lg border">
        {segments.length > 0 && (
          <li className="border-border border-b">
            <button
              type="button"
              onClick={() => onNavigate(parent)}
              className="hover:bg-card/60 flex w-full items-center px-3 py-2 text-left"
            >
              ..
            </button>
          </li>
        )}
        {entries.length === 0 && (
          <li>
            <EmptyState
              illustration={<HairlineFigure figure={Drawer} />}
              title="This folder is empty"
              description="There are no files or folders at this path yet."
            />
          </li>
        )}
        {entries.map((entry) => (
          <li key={entry.path} className="border-border border-b last:border-b-0">
            {entry.type === "dir" ? (
              <button
                type="button"
                onClick={() => onNavigate(entry.path)}
                className="hover:bg-card/60 flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="bg-subtle size-2 shrink-0 rounded-sm" />
                  <span className="truncate font-medium">{entry.name}/</span>
                </span>
              </button>
            ) : (
              <a
                href={entry.htmlUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-card/60 flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="border-subtle size-2 shrink-0 rounded-sm border" />
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="caption-style text-subtle shrink-0 tabular-nums">
                  {formatSize(entry.size)}
                </span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
