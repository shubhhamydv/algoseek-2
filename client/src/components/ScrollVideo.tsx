import React, { useEffect, useRef, useState, useCallback } from "react";

interface ScrollVideoProps {
  /** Path to the video file */
  src?: string;
  /** Height of the scroll container to control scrub distance (default: "320vh") */
  sectionHeight?: string;
  /** Optional class name for the wrapper */
  className?: string;
  /** Optional content/overlays rendered inside the sticky container */
  children?: React.ReactNode;
}

/**
 * ScrollVideo
 * Premium scroll-scrubbed interactive video component.
 *
 * Rules:
 * - NO autoplay, NO continuous playback, NO loop.
 * - Scroll position directly maps to video.currentTime.
 * - Scrolling DOWN scrubs forward; scrolling UP scrubs backward.
 * - Stopping scroll freezes the video at that exact frame.
 * - Uses requestAnimationFrame and seek-queuing to prevent frame drops or decoder locking.
 * - Uses native <video> element directly (no extracted images, canvas sequences, or GIFs).
 */
export function ScrollVideo({
  src = "/scroll-hero.mp4",
  sectionHeight = "320vh",
  className = "",
  children,
}: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Cached layout dimensions to eliminate getBoundingClientRect() during scroll
  const layoutRef = useRef({ top: 0, scrollableDistance: 1 });
  const isSeekingRef = useRef(false);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  // Check prefers-reduced-motion
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
    const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
    layoutRef.current = { top, scrollableDistance };
  }, []);

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
      // Smooth lerp toward target scroll position
      currentProgressRef.current += diff * 0.18;
    }

    const targetTime = currentProgressRef.current * (video.duration - 0.001);

    // Seek only when diff exceeds 25ms to prevent video decoder pipeline stalls
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
    const { top, scrollableDistance } = layoutRef.current;
    const progress = Math.max(0, Math.min(1, (scrollY - top) / scrollableDistance));
    targetProgressRef.current = progress;

    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsLoaded(true);
      measureLayout();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.muted = true;
      video.defaultMuted = true;
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
  }, [measureLayout, onScroll, tick]);

  return (
    <div
      ref={containerRef}
      className={`scroll-video-section ${className}`}
      style={{
        position: "relative",
        height: sectionHeight,
        width: "100%",
      }}
    >
      {/* Sticky Viewport Container */}
      <div
        className="scroll-video-sticky"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050a14",
        }}
      >
        {/* Native Interactive Video (No frame sequences, no canvas, no GIF) */}
        {!loadError ? (
          <video
            ref={videoRef}
            src={src}
            poster="/scroll-hero-poster.webp"
            muted
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onLoadedMetadata={handleLoadedMetadata}
            onSeeked={handleSeeked}
            onError={() => {
              console.warn("[ScrollVideo] Error loading scroll video, falling back gracefully.");
              setLoadError(true);
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
              opacity: isLoaded ? 1 : 0.4,
              transition: "opacity 0.4s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(ellipse at 50% 50%, #0c182b 0%, #050a14 100%)",
            }}
          />
        )}

        {/* Cinematic Ambient Vignette Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(5,10,20,0.5) 0%, transparent 20%, transparent 80%, rgba(5,10,20,0.9) 100%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,10,20,0.6) 100%)",
          }}
        />

        {/* Children (e.g. Hero copy overlay) */}
        {children && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScrollVideo;
