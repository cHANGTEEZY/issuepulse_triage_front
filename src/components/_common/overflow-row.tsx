"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Tag from "@/components/_ui/tag";
import { cn } from "@/lib/utils";

export type OverflowItem = {
  key: string;
  label: string;
  node: ReactNode;
};

type OverflowRowProps = {
  items: OverflowItem[];
  gap?: number;
  className?: string;
};

export default function OverflowRow({ items, gap = 6, className }: OverflowRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(items.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    function compute() {
      if (!container || !measure) return;
      const width = container.clientWidth;
      const children = Array.from(measure.children) as HTMLElement[];
      const chip = children.pop();
      const chipWidth = chip?.offsetWidth ?? 0;

      let used = 0;
      let count = 0;
      for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        if (!child) break;
        const next = used + (count > 0 ? gap : 0) + child.offsetWidth;
        const remaining = children.length - (index + 1);
        const reserve = remaining > 0 ? gap + chipWidth : 0;
        if (next + reserve > width) break;
        used = next;
        count += 1;
      }
      setVisible(count);
    }

    compute();
    const observer = new ResizeObserver(() => compute());
    observer.observe(container);
    return () => observer.disconnect();
  }, [items, gap]);

  const shown = items.slice(0, visible);
  const hidden = items.slice(visible);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex min-w-0 flex-1 items-center overflow-hidden", className)}
      style={{ gap }}
    >
      {shown.map((item) => (
        <span key={item.key} className="flex shrink-0 items-center">
          {item.node}
        </span>
      ))}
      {hidden.length > 0 && (
        <Tag
          tone="neutral"
          size="sm"
          title={hidden.map((item) => item.label).join(", ")}
          className="shrink-0"
        >
          +{hidden.length}
        </Tag>
      )}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 flex w-max items-center whitespace-nowrap"
        style={{ gap }}
      >
        {items.map((item) => (
          <span key={item.key} className="flex shrink-0 items-center">
            {item.node}
          </span>
        ))}
        <Tag tone="neutral" size="sm">
          +{items.length}
        </Tag>
      </div>
    </div>
  );
}
