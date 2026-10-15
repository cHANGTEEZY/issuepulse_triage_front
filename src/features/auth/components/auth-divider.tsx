export default function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="bg-border h-px flex-1" />
      <span className="caption-style text-subtle">or</span>
      <span aria-hidden className="bg-border h-px flex-1" />
    </div>
  );
}
