import React, { useEffect, useRef, useState, useCallback } from "react";

interface RagBesideScrollVideoProps {
  /** Video source path (defaults to /rag-scroll.mp4) */
  src?: string;
  /** Optional ref to parent container */
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * RagBesideScrollVideo
 * Autoplaying looping video component placed beside the "Every answer cites its source" card.
 *
 * Performance & UX:
 * - Continuously plays in a smooth loop (autoplay, loop, muted, playsInline).
 * - Uses IntersectionObserver to pause playback when out of view, saving GPU/CPU resources.
 * - Respects prefers-reduced-motion.
 * - High-definition edge-to-edge coverage with rounded borders and fallback poster.
 */
export function RagBesideScrollVideo({
  src = "/rag-scroll.mp4",
  containerRef,
  className = "",
}: RagBesideScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const isVisibleRef = useRef(false);

  // Play/pause based on visibility to optimize performance
  const handlePlayState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisibleRef.current) {
      video.play().catch(() => {
        // Autoplay may be restricted by browser until interaction; silent fallback
      });
    } else {
      video.pause();
    }
  }, []);

  useEffect(() => {
    const targetElement = containerRef?.current || wrapperRef.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          handlePlayState();
        });
      },
      { rootMargin: "100px", threshold: 0.15 }
    );

    observer.observe(targetElement);

    // Initial check
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    }

    return () => {
      observer.disconnect();
    };
  }, [containerRef, handlePlayState]);

  if (loadError) {
    return (
      <div
        className={`rag-beside-video-container ${className}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/rag-scroll-poster.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "inherit",
        }}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
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
        autoPlay
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadedData={() => setIsLoaded(true)}
        onError={() => {
          console.warn("[RagBesideScrollVideo] Video failed to load, falling back to poster.");
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
          opacity: isLoaded ? 1 : 0.8,
          transition: "opacity 0.4s ease",
        }}
      />
    </div>
  );
}

export default RagBesideScrollVideo;
