"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { HairlineProps } from "@lucasmarkes/hairline/react";
import kernelSource from "./kernel.js?raw";
import { cn } from "@/lib/utils";

type Point = [number, number];

type FigureHandle = {
  set: (value: number) => void;
  destroy: () => void;
};

type FigureDefinition = {
  name: string;
  means: string;
  range: [number, number, number];
  tour: (Point | null)[] | null;
  mount: (
    host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string } },
    value: number,
  ) => FigureHandle;
};

type Kernel = {
  inject: (root: Document) => void;
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => Element;
  tour: (stage: HTMLElement, stops: (Point | null)[]) => { stop: () => void };
  reducedMotion: () => boolean;
  LAP: (Point | null)[];
};

let kernel: Kernel | undefined;

function loadKernel() {
  kernel ??= new Function(`${kernelSource}\nreturn HL;`)() as Kernel;
  return kernel;
}

function loadFigure(source: string) {
  let definition: FigureDefinition | undefined;
  new Function("HL", "hairline", source)(
    loadKernel(),
    (figure: FigureDefinition) => {
      definition = figure;
    },
  );
  if (!definition) throw new Error("hairline: the figure never called hairline().");
  return definition;
}

function valueAt([lo, mid, hi]: FigureDefinition["range"], intensity: number) {
  const t = Math.min(1, Math.max(0, Number.isFinite(intensity) ? intensity : 0.5));
  return t <= 0.5 ? lo + (t / 0.5) * (mid - lo) : mid + ((t - 0.5) / 0.5) * (hi - mid);
}

export function createFigure(source: string) {
  let definition: FigureDefinition | undefined;

  function CustomFigure({
    intensity = 0.5,
    play = false,
    theme = "auto",
    label,
    onRead,
    className,
    ...props
  }: HairlineProps) {
    const host = useRef<HTMLDivElement>(null);
    const handle = useRef<FigureHandle | null>(null);
    const latest = useRef({ intensity, onRead });
    useLayoutEffect(() => {
      latest.current = { intensity, onRead };
    });

    useLayoutEffect(() => {
      const stage = host.current;
      if (!stage) return;
      const HL = loadKernel();
      definition ??= loadFigure(source);
      const figure = definition;

      HL.inject(document);
      stage.setAttribute("data-hairline", figure.name);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage) as SVGSVGElement;
      let text = "";
      const read = {
        get textContent() {
          return text;
        },
        set textContent(value: string) {
          text = value;
          latest.current.onRead?.(value);
        },
      };
      handle.current = figure.mount({ stage, svg, read }, valueAt(figure.range, latest.current.intensity));
      const walk = play && !HL.reducedMotion() ? HL.tour(stage, figure.tour ?? HL.LAP) : null;

      return () => {
        walk?.stop();
        handle.current?.destroy();
        handle.current = null;
        svg.remove();
        stage.removeAttribute("data-hairline");
      };
    }, [play]);

    useEffect(() => {
      if (definition) handle.current?.set(valueAt(definition.range, intensity));
    }, [intensity]);

    return (
      <div
        ref={host}
        role="img"
        aria-label={label ?? definition?.means}
        data-hairline-theme={theme === "auto" ? undefined : theme}
        className={cn("relative block aspect-[5/4]", className)}
        {...props}
      />
    );
  }

  return CustomFigure;
}
