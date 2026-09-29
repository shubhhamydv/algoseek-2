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

  // Seeking state refs to avoid React re-renders during high-frequency scrolls
  const isSeekingRef = useRef(false);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const executeSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    const clampedTime = Math.max(0, Math.min(video.duration - 0.001, targetTimeRef.current));

    // Avoid redundant seek if already within 20ms of target
    if (Math.abs(video.currentTime - clampedTime) < 0.02) {
      return;
    }

    try {
      isSeekingRef.current = true;
      video.currentTime = clampedTime;
    } catch {
      isSeekingRef.current = false;
    }
  }, []);

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // If scroll moved while the previous seek was processing, resolve to latest targetTime
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.03) {
      executeSeek();
    }
  }, [executeSeek]);

  const updateScrollProgress = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.duration || isNaN(video.duration)) return;

    const rect = container.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;

    if (scrollableDistance <= 0) return;

    // progress: 0 when container top is at viewport top, 1 when container bottom meets viewport bottom
    const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
    targetTimeRef.current = progress * video.duration;

    if (!isSeekingRef.current) {
      executeSeek();
    }
  }, [executeSeek]);

  const onScroll = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      updateScrollProgress();
    });
  }, [updateScrollProgress]);

  // Video metadata loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      video.pause(); // Ensure strictly no autoplay
      video.currentTime = 0; // Start at 0s
      setIsLoaded(true);
      updateScrollProgress();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.muted = true;
      video.defaultMuted = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial calculation
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onScroll, updateScrollProgress]);

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
