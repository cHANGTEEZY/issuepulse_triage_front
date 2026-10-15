import { useState, type ComponentProps } from "react";
import AuthField from "./auth-field";

type PasswordFieldProps = Omit<
  ComponentProps<typeof AuthField>,
  "type" | "action"
>;

export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      type={visible ? "text" : "password"}
      action={
        <button
          type="button"
          className="text-subtle hover:text-foreground focus-visible:ring-ring/60 flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.1 6.1A2 2 0 0 0 8 10a2 2 0 0 0 1.9-1.3M3.2 3.2 12.8 12.8" />
      <path d="M4.3 4.6C2.6 5.8 1.5 8 1.5 8s2.4 4.5 6.5 4.5c1.1 0 2.1-.3 3-.8M11.7 11.2C13.3 10 14.5 8 14.5 8s-2.4-4.5-6.5-4.5c-.5 0-1 .1-1.4.2" />
    </svg>
  );
}
