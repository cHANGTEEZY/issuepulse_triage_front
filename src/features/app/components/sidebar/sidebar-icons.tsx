import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-3.5 shrink-0"}
      {...props}
    >
      {children}
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
      <circle cx="6" cy="4.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="11.5" r="1.25" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.2 2.2H3.6A1.4 1.4 0 0 0 2.2 3.6v8.8A1.4 1.4 0 0 0 3.6 13.8h2.6" />
      <path d="M7 8h6.8M10.8 5.2 13.8 8l-3 2.8" />
    </Icon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="2.4" />
      <path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12.6 10.2A5.2 5.2 0 0 1 6 3.4 5.4 5.4 0 1 0 12.6 10.2Z" />
    </Icon>
  );
}
