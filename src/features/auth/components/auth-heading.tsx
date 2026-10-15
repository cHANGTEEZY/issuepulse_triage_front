type AuthHeadingProps = {
  title: string;
  description: string;
};

export default function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="display-style">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
