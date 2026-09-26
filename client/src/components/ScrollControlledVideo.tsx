import React, { useEffect, useRef, useState, useCallback } from "react";

interface ScrollControlledVideoProps {
  /** Video source path (defaults to /rag-scroll.mp4) */
  src?: string;
  /** Height of the scroll container to calibrate scroll scrub distance (default: "300vh") */
  sectionHeight?: string;
  /** Optional container class name */
  className?: string;
}

/**
 * ScrollControlledVideo
 * Reusable scroll-controlled interactive video component.
 *
 * Core Rules:
 * 1. NO autoplay, NO loop, NO continuous playback, NO controls.
 * 2. Uses native <video> element directly (no image sequences, canvas, or GIFs).
 * 3. Scroll position directly controls video.currentTime:
 *      Scroll DOWN → scrubs forward (0s → duration)
 *      Scroll UP   → scrubs backward (duration → 0s)
 *      Stop scroll → freezes at exact frame
 * 4. requestAnimationFrame and seek-queuing prevent decoder bottleneck and frame drops.
 * 5. Sticky viewport ensures video stays centered while scrubbing.
 * 6. Subtle entrance animation (scale 0.97 → 1, opacity 0.85 → 1) as section enters view.
 */
export function ScrollControlledVideo({
  src = "/rag-scroll.mp4",
  sectionHeight = "300vh",
  className = "",
}: ScrollControlledVideoProps) {
  const containerRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // State refs to avoid React re-renders during high-frequency scrolls
  const isSeekingRef = useRef(false);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const executeSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    // Clamp time strictly between 0 and duration - 0.001 (prevents 'ended' event freeze)
    const clampedTime = Math.max(0, Math.min(video.duration - 0.001, targetTimeRef.current));

    // Avoid seek if already within 20ms of target
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

    // If scroll position changed while previous seek was processing, resolve to latest targetTime
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.025) {
      executeSeek();
    }
  }, [executeSeek]);

  const updateScrollProgress = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;

    if (scrollableDistance <= 0) return;

    // Calculate subtle entrance effect before the sticky container locks (when rect.top > 0)
    if (frameRef.current) {
      if (rect.top > 0) {
        const threshold = window.innerHeight * 0.6;
        const entrance = Math.max(0, Math.min(1, 1 - (rect.top / threshold)));
        const scale = 0.97 + (0.03 * entrance);
        const opacity = 0.82 + (0.18 * entrance);
        frameRef.current.style.transform = `scale(${scale})`;
        frameRef.current.style.opacity = `${opacity}`;
      } else {
        frameRef.current.style.transform = "scale(1)";
        frameRef.current.style.opacity = "1";
      }
    }

    if (!video || !video.duration || isNaN(video.duration)) return;

    // Progress: 0 when container top reaches viewport top, 1 when container reaches bottom
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

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause(); // Strictly no autoplay
      video.currentTime = 0.001; // Render first frame immediately
      setIsReady(true);
      updateScrollProgress();
    }
  }, [updateScrollProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.muted = true;
      video.defaultMuted = true;
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onScroll, updateScrollProgress, handleLoadedMetadata]);

  return (
    <section
      ref={containerRef}
      className={`scroll-video-section ${className}`}
      aria-label="Interactive 3D RAG Architecture Animation"
      style={{
        position: "relative",
        height: sectionHeight,
        width: "100%",
        backgroundColor: "transparent",
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
          pointerEvents: "none",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(16, 185, 129, 0.12) 0%, rgba(5, 10, 20, 0.55) 60%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Video Frame */}
        {!loadError ? (
          <div
            ref={frameRef}
            className="scroll-video-frame"
            style={{
              position: "relative",
              width: "auto",
              height: "min(720px, 80vh)",
              maxWidth: "min(480px, 88vw)",
              aspectRatio: "1080 / 1690",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid oklch(0.7 0.08 175 / 0.22)",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.75), 0 0 45px rgba(16, 185, 129, 0.16)",
              backgroundColor: "#050a14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease",
              opacity: isReady ? 1 : 0.6,
            }}
          >
            <video
              ref={videoRef}
              src={src}
              muted
              playsInline
              preload="auto"
              controls={false}
              autoPlay={false}
              loop={false}
              disablePictureInPicture
              disableRemotePlayback
              onLoadedMetadata={handleLoadedMetadata}
              onSeeked={handleSeeked}
              onError={() => {
                console.warn("[ScrollControlledVideo] Video error, falling back gracefully.");
                setLoadError(true);
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ScrollControlledVideo;
