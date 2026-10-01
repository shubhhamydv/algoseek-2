import React, { useEffect, useRef, useState, useCallback } from "react";

interface ScrollVideoProps {
  /** Path to the video file */
  src?: string;
  /** Height of the scroll container to control scrub/parallax distance (default: "300vh") */
  sectionHeight?: string;
  /** Optional class name for the wrapper */
  className?: string;
  /** Optional content/overlays rendered inside the sticky container */
  children?: React.ReactNode;
}

/**
 * ScrollVideo (Phase 4 High-Reliability Decoupled Architecture)
 *
 * Performance Architecture:
 * 1. Decoupled Video Autoplay:
 *    - The video autoplays smoothly on a dedicated hardware decoder queue when visible.
 *    - Eliminates video.currentTime seeking entirely, avoiding hardware decoder pipeline stalls.
 *    - Automatically pauses when scrolled out of view via IntersectionObserver to save GPU/CPU cycles.
 * 2. 100% GPU-Composited Scroll Parallax:
 *    - Scroll position drives a silky-smooth transform (translate3d + scale) and opacity fade.
 *    - Direct DOM ref updates avoid React re-renders during high-frequency scrolls.
 *    - Zero layout properties (no top, left, width, height, margin) — zero reflows.
 *    - will-change: transform, opacity hints isolate the layer on the GPU compositor.
 * 3. Throttled requestAnimationFrame + Passive Event Listeners:
 *    - Reads window.scrollY and updates lerped progress inside rAF.
 *    - Registered with { passive: true } to eliminate main-thread scroll blocking.
 * 4. Full Reduced-Motion Support:
 *    - Detects prefers-reduced-motion: reduce.
 *    - Pauses video, disables motion transformations, renders crisp static frame.
 * 5. Robust Error Handling:
 *    - Gracefully falls back to poster and branded dark ambient gradient on video load errors.
 */
export function ScrollVideo({
  src = "/scroll-hero.mp4",
  sectionHeight = "300vh",
  className = "",
  children,
}: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Cached layout metrics to avoid getBoundingClientRect() during scroll
  const layoutRef = useRef({ top: 0, scrollableDistance: 1 });
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
      const handler = () => {
        reducedMotionRef.current = q.matches;
        if (videoRef.current) {
          if (q.matches) {
            videoRef.current.pause();
          } else if (isVisibleRef.current) {
            videoRef.current.play().catch(() => {});
          }
        }
      };
      q.addEventListener("change", handler);
      return () => q.removeEventListener("change", handler);
    }
  }, []);

  // Measure container layout
  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop;
    const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
    layoutRef.current = { top, scrollableDistance };
  }, []);

  // GPU-composited transform and opacity update
  const applyTransform = useCallback((progress: number) => {
    const wrapper = visualWrapperRef.current;
    if (!wrapper) return;

    if (reducedMotionRef.current) {
      wrapper.style.transform = "none";
      wrapper.style.opacity = "1";
      return;
    }

    // Parallax translation (translate3d) and subtle scale contraction
    const translateY = progress * -70; // 0px -> -70px
    const scale = 1 - progress * 0.04;  // 1 -> 0.96
    const opacity = Math.max(0.25, 1 - progress * 0.6); // 1 -> 0.25

    wrapper.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    wrapper.style.opacity = opacity.toFixed(3);
  }, []);

  // Animation frame tick loop
  const tick = useCallback(() => {
    if (!isVisibleRef.current) {
      animationFrameRef.current = null;
      return;
    }

    if (reducedMotionRef.current) {
      applyTransform(0);
      animationFrameRef.current = null;
      return;
    }

    const diff = targetProgressRef.current - currentProgressRef.current;
    if (Math.abs(diff) < 0.0005) {
      currentProgressRef.current = targetProgressRef.current;
    } else {
      // Smooth lerp factor
      currentProgressRef.current += diff * 0.2;
    }

    applyTransform(currentProgressRef.current);

    if (Math.abs(targetProgressRef.current - currentProgressRef.current) > 0.0005) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      animationFrameRef.current = null;
    }
  }, [applyTransform]);

  // Passive scroll listener
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

  const handleLoadedData = () => {
    setIsLoaded(true);
    const video = videoRef.current;
    if (video && isVisibleRef.current && !reducedMotionRef.current) {
      video.play().catch(() => {});
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;

    measureLayout();
    applyTransform(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            measureLayout();
            if (video && !reducedMotionRef.current) {
              video.play().catch(() => {});
            }
            if (animationFrameRef.current === null) {
              animationFrameRef.current = requestAnimationFrame(tick);
            }
          } else {
            if (video) {
              video.pause();
            }
            if (animationFrameRef.current !== null) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        });
      },
      { rootMargin: "150px" }
    );

    if (container) observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      measureLayout();
    });
    if (container) resizeObserver.observe(container);

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
  }, [measureLayout, onScroll, tick, applyTransform]);

  return (
    <div
      ref={containerRef}
      className={`scroll-video-section ${className}`}
      style={{
        position: "relative",
        height: sectionHeight,
        width: "100%",
        contain: "paint layout",
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
          willChange: "transform",
        }}
      >
        {/* Parallax GPU Visual Wrapper */}
        <div
          ref={visualWrapperRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            willChange: "transform, opacity",
            transform: "translate3d(0, 0, 0)",
            pointerEvents: "none",
          }}
        >
          {!loadError ? (
            <video
              ref={videoRef}
              src={src}
              poster="/scroll-hero-poster.webp"
              muted
              playsInline
              loop
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              onLoadedData={handleLoadedData}
              onError={() => {
                console.warn("[ScrollVideo] Video playback error, using fallback background.");
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
                opacity: isLoaded ? 1 : 0.6,
                transition: "opacity 0.4s ease",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: "url('/scroll-hero-poster.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
        </div>

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
