"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import AssetPoster from "./asset-poster";
import { assetMediaClass } from "./asset-frame";
import type { AssetFit, AssetLottieProps } from "./asset-types";

const Lottie = lazy(() => import("lottie-react"));

const LOTTIE_FIT: Record<AssetFit, string> = {
  cover: "xMidYMid slice",
  contain: "xMidYMid meet",
  fill: "none",
  none: "xMidYMid meet",
};

function AssetLottie({
  src,
  poster,
  alt,
  fit = "cover",
  mediaClassName,
  loop = true,
  autoplay = true,
}: AssetLottieProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(src)
      .then((response) => response.json())
      .then((data) => {
        if (active) setAnimationData(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [src]);

  return (
    <>
      <AssetPoster src={poster} alt={alt} fit={fit} visible={!loaded} />
      {animationData ? (
        <Suspense fallback={null}>
          <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            onDOMLoaded={() => setLoaded(true)}
            rendererSettings={{ preserveAspectRatio: LOTTIE_FIT[fit] }}
            className={assetMediaClass(fit, mediaClassName)}
          />
        </Suspense>
      ) : null}
    </>
  );
}

export default AssetLottie;
