"use client";

import type { ComponentType } from "react";
import type { HairlineProps } from "@lucasmarkes/hairline/react";
import { cn } from "@/lib/utils";

const SURFACE_CLASS = {
  background: "[--hairline-plate:var(--background)]",
  card: "[--hairline-plate:var(--card)]",
} as const;

type HairlineFigureProps = HairlineProps & {
  figure: ComponentType<HairlineProps>;
  surface?: keyof typeof SURFACE_CLASS;
};

export default function HairlineFigure({
  figure: Figure,
  surface = "background",
  className,
  ...props
}: HairlineFigureProps) {
  return (
    <Figure
      className={cn(
        "w-full [--hairline-edge:var(--soft)] [--hairline-hi:var(--foreground)] [--hairline-lo:var(--faint)] [--hairline-mid:var(--subtle)] [--hairline-stroke:0.9]",
        SURFACE_CLASS[surface],
        className,
      )}
      {...props}
    />
  );
}
