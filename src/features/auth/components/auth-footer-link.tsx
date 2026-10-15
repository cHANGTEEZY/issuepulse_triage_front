import { Link } from "@tanstack/react-router";

type AuthFooterLinkProps = {
  prompt: string;
  to: "/login" | "/register" | "/reset-password";
  label: string;
};

export default function AuthFooterLink({
  prompt,
  to,
  label,
}: AuthFooterLinkProps) {
  return (
    <p className="text-muted-foreground text-center">
      {prompt}{" "}
      <Link
        to={to}
        className="text-foreground hover:text-soft underline decoration-from-font underline-offset-2"
      >
        {label}
      </Link>
    </p>
  );
}
