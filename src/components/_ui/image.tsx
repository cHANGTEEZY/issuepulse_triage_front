import type { CSSProperties, ImgHTMLAttributes } from "react";

export type StaticImageData = {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

type ImageProps = {
  src: string | StaticImageData;
  alt: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string | null;
  priority?: boolean;
  unoptimized?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

export default function Image({
  src,
  alt,
  fill = false,
  sizes,
  quality: _quality,
  placeholder = "empty",
  blurDataURL,
  priority = false,
  unoptimized: _unoptimized,
  className,
  style,
  width,
  height,
  loading,
  draggable,
  onLoad,
  ...props
}: ImageProps) {
  const url = typeof src === "string" ? src : src.src;
  const blurSource =
    placeholder === "blur"
      ? (blurDataURL ??
        (typeof src === "object" ? src.blurDataURL : undefined))
      : undefined;

  const resolvedStyle: CSSProperties = {
    ...(fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
      : {}),
    ...(blurSource
      ? {
          backgroundImage: `url(${blurSource})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    ...style,
  };

  return (
    <img
      {...props}
      src={url}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      draggable={draggable}
      loading={priority ? "eager" : (loading ?? "lazy")}
      fetchPriority={priority ? "high" : undefined}
      style={resolvedStyle}
      className={className}
      onLoad={onLoad}
    />
  );
}
