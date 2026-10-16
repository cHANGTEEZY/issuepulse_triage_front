"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { COLUMN_KEYBOARD_STEP } from "./column-sizing";
import { cn } from "@/lib/utils";

type DataTableResizerProps = {
  label: string;
  width: number;
  min: number;
  max: number;
  onResize: (width: number) => void;
  onCommit: () => void;
  onReset: () => void;
};

export default function DataTableResizer({
  label,
  width,
  min,
  max,
  onResize,
  onCommit,
  onReset,
}: DataTableResizerProps) {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    onResize(drag.current.startWidth + event.clientX - drag.current.startX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onCommit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next: Record<string, number> = {
      ArrowLeft: width - COLUMN_KEYBOARD_STEP,
      ArrowRight: width + COLUMN_KEYBOARD_STEP,
      Home: min,
      End: max,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    onResize(next[event.key] ?? width);
    onCommit();
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "group/resizer absolute inset-y-0 -right-1.5 z-10 flex w-3 cursor-col-resize touch-none items-center justify-center outline-none select-none",
      )}
    >
      <span
        aria-hidden
        className="flex h-3.5 items-center gap-px opacity-40 transition-opacity duration-150 ease-power3-out group-hover/resizer:opacity-100 group-focus-visible/resizer:opacity-100 group-active/resizer:opacity-100"
      >
        <span className="bg-subtle block h-full w-px rounded-full group-hover/resizer:bg-foreground group-active/resizer:bg-foreground" />
        <span className="bg-subtle block h-full w-px rounded-full group-hover/resizer:bg-foreground group-active/resizer:bg-foreground" />
      </span>
    </div>
  );
}
