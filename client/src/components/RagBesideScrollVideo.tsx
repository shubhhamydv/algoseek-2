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

  const isSeekingRef = useRef(false);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const executeSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    const clampedTime = Math.max(0, Math.min(video.duration - 0.001, targetTimeRef.current));

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

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.025) {
      executeSeek();
    }
  }, [executeSeek]);

  const updateScrollProgress = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.duration || isNaN(video.duration)) return;

    const rect = container.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;

    let progress = 0;
    if (scrollableDistance > 80) {
      // Sticky section scroll mode
      progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
    } else {
      // Normal flow mode (e.g. mobile)
      const totalRange = window.innerHeight + rect.height;
      const currentPos = window.innerHeight - rect.top;
      progress = Math.max(0, Math.min(1, currentPos / totalRange));
    }

    targetTimeRef.current = progress * (video.duration - 0.001);

    if (!isSeekingRef.current) {
      executeSeek();
    }
  }, [containerRef, executeSeek]);

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
      video.currentTime = 0.001; // Render first frame
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
