"use client";

import {
  ThemeSwitch,
  type ThemeSwitchVariant,
} from "@/components/arc/theme-switch/theme-switch";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type AppearanceSwitchProps = {
  variant?: ThemeSwitchVariant;
  iconOnly?: boolean;
  className?: string;
};

export default function AppearanceSwitch({
  variant = "reveal",
  iconOnly = false,
  className,
}: AppearanceSwitchProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        iconOnly &&
          "[&_button]:size-[30px] [&_button]:min-h-[30px] [&_button]:min-w-[30px] [&_button]:rounded-full",
        className,
      )}
    >
      <ThemeSwitch
        theme={theme}
        variant={variant}
        iconOnly={iconOnly}
        onThemeChange={(next, _nextVariant, trigger) => {
          const apply = () => setTheme(next);
          const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          if (reduced || !document.startViewTransition) {
            apply();
            return;
          }

          const rect = trigger.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
          );

          document.documentElement.style.setProperty("--theme-x", `${x}px`);
          document.documentElement.style.setProperty("--theme-y", `${y}px`);
          document.documentElement.style.setProperty("--theme-r", `${radius}px`);
          document.startViewTransition(apply);
        }}
      />
    </div>
  );
}
