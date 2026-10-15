import Avatar from "@/components/_ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  className?: string;
};

export default function UserAvatar({
  name,
  image,
  className,
}: UserAvatarProps) {
  if (image) {
    return <Avatar src={image} alt="" className={className} />;
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[12px] font-medium text-[#171717] outline-1 -outline-offset-1 outline-white/10",
        className,
      )}
    >
      {initial}
    </span>
  );
}
