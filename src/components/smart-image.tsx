import { useState, type ImgHTMLAttributes } from "react";

type Ratio = "3/4" | "4/5" | "1/1" | "16/9" | "2/3" | "3/2";

const DIMS: Record<Ratio, { w: number; h: number }> = {
  "3/4": { w: 900, h: 1200 },
  "4/5": { w: 960, h: 1200 },
  "1/1": { w: 1000, h: 1000 },
  "16/9": { w: 1600, h: 900 },
  "2/3": { w: 800, h: 1200 },
  "3/2": { w: 1200, h: 800 },
};

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> & {
  src: string;
  alt: string;
  /** Intrinsic aspect ratio — reserves space so the image never shifts layout. */
  ratio?: Ratio;
  width?: number;
  height?: number;
  /** Wrapper class; the image itself fills it. */
  wrapperClassName?: string;
};

/**
 * One image primitive for the whole site: reserved intrinsic size (no layout
 * shift), async decoding, lazy by default, and a consistent quiet fallback
 * when a source fails.
 */
export function SmartImage({
  src,
  alt,
  ratio = "3/4",
  width,
  height,
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  decoding = "async",
  onError,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const dims = DIMS[ratio];

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-surface-elevated ${wrapperClassName} ${className}`}
        style={{ aspectRatio: ratio.replace("/", " / ") }}
      />
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      width={width ?? dims.w}
      height={height ?? dims.h}
      loading={loading}
      decoding={decoding}
      style={{ aspectRatio: ratio.replace("/", " / "), ...(rest.style ?? {}) }}
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
