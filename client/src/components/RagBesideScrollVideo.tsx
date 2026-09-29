import React, { useEffect, useRef, useState, useCallback } from "react";

interface RagBesideScrollVideoProps {
  /** Video source path (defaults to /rag-scroll.mp4) */
  src?: string;
  /** Ref to the parent showcase section */
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * RagBesideScrollVideo
 * Scroll-controlled video component placed beside the "Every answer cites its source" card.
 *
 * Rules:
 * - Fills the entire card area edge-to-edge (object-fit: cover, no letterboxing/empty free space).
 * - Matches the visual fullness of the former 3D element.
 * - Scroll position directly controls video.currentTime:
 *     Scroll DOWN  → scrubs forward (0s → ~4s)
 *     Scroll UP    → scrubs backward (~4s → 0s)
 *     Stop scroll  → freezes at exact frame
 * - NO autoplay, NO loop, NO continuous playback, NO controls.
 */
export function RagBesideScrollVideo({
  src = "/rag-scroll.mp4",
  containerRef,
  className = "",
}: RagBesideScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const layoutRef = useRef({ top: 0, height: 0, scrollableDistance: 1 });
  const isSeekingRef = useRef(false);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = q.matches;
      const handler = () => { reducedMotionRef.current = q.matches; };
      q.addEventListener("change", handler);
      return () => q.removeEventListener("change", handler);
    }
  }, []);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop;
    const height = rect.height;
    const scrollableDistance = height - window.innerHeight;
    layoutRef.current = { top, height, scrollableDistance };
  }, [containerRef]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration) || !isVisibleRef.current) {
      animationFrameRef.current = null;
      return;
    }

    if (reducedMotionRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const diff = targetProgressRef.current - currentProgressRef.current;
    if (Math.abs(diff) < 0.001) {
      currentProgressRef.current = targetProgressRef.current;
    } else {
      currentProgressRef.current += diff * 0.18;
    }

    const targetTime = currentProgressRef.current * (video.duration - 0.001);

    if (!isSeekingRef.current && Math.abs(video.currentTime - targetTime) > 0.025) {
      try {
        isSeekingRef.current = true;
        video.currentTime = targetTime;
      } catch {
        isSeekingRef.current = false;
      }
    }

    if (Math.abs(targetProgressRef.current - currentProgressRef.current) > 0.001) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      animationFrameRef.current = null;
    }
  }, []);

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
  }, []);

  const onScroll = useCallback(() => {
    if (!isVisibleRef.current) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const { top, height, scrollableDistance } = layoutRef.current;

    let progress = 0;
    if (scrollableDistance > 80) {
      progress = Math.max(0, Math.min(1, (scrollY - top) / scrollableDistance));
    } else {
      const totalRange = window.innerHeight + height;
      const currentPos = (scrollY + window.innerHeight) - top;
      progress = Math.max(0, Math.min(1, currentPos / (totalRange || 1)));
    }
    targetProgressRef.current = progress;

    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0.001;
      setIsReady(true);
      measureLayout();
    }
  }, [measureLayout]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (video) {
      video.pause();
      video.muted = true;
      video.defaultMuted = true;
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }
    }
    if (!container) return;

    measureLayout();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            measureLayout();
            if (animationFrameRef.current === null) {
              animationFrameRef.current = requestAnimationFrame(tick);
            }
          } else if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        });
      },
      { rootMargin: "150px" }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      measureLayout();
    });
    resizeObserver.observe(container);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureLayout, { passive: true });

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureLayout);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [containerRef, onScroll, measureLayout, handleLoadedMetadata, tick]);

  if (loadError) return null;

  return (
    <div
      className={`rag-beside-video-container ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster="/rag-scroll-poster.webp"
        muted
        playsInline
        preload="metadata"
        controls={false}
        autoPlay={false}
        loop={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onError={() => {
          console.warn("[RagBesideScrollVideo] Video failed to load, falling back gracefully.");
          setLoadError(true);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 45%",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          opacity: isReady ? 1 : 0.7,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

export default RagBesideScrollVideo;
