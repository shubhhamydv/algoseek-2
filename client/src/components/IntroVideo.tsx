import React, { useEffect, useRef, useState, useCallback } from "react";

interface IntroVideoProps {
  /** Video source path or URL (defaults to /intro.mp4) */
  src?: string;
  /** Callback fired when the intro finishes or fails and unmounts */
  onComplete: () => void;
  /** Fade out duration in milliseconds (default: 500ms) */
  fadeDurationMs?: number;
}

type IntroState = "initial" | "playing" | "fading" | "done";

/**
 * IntroVideo
 * Full-screen loading/intro video experience displayed on initial page load.
 *
 * Requirements:
 * - 100vw x 100vh, object-fit: cover, centered, no scrollbars or controls.
 * - Autoplays muted once on mount.
 * - When playback ends or fails, smoothly fades out over 400-600ms.
 * - Completely unmounts once the transition is complete.
 * - Respects prefers-reduced-motion.
 * - Prevents scrolling while active; restores scroll when complete.
 */
export function IntroVideo({
  src = "/intro.mp4",
  onComplete,
  fadeDurationMs = 500,
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<IntroState>("initial");
  const hasFinishedRef = useRef(false);

  // Complete and unmount cleanly
  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setState("done");
    onComplete();
  }, [onComplete]);

  // Trigger smooth fade out
  const triggerFadeOut = useCallback(() => {
    if (hasFinishedRef.current || state === "fading" || state === "done") return;

    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      finish();
      return;
    }

    setState("fading");
    setTimeout(() => {
      finish();
    }, fadeDurationMs);
  }, [fadeDurationMs, finish, state]);

  // Lock scrolling while the intro is active; restore when unmounted
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
    };
  }, []);

  // Programmatic autoplay and fallback watchdog
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure muted for strict browser autoplay policies
    video.muted = true;
    video.defaultMuted = true;

    // Try playing programmatically
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setState("playing");
        })
        .catch((error) => {
          console.warn("[IntroVideo] Autoplay prevented or failed, revealing website:", error);
          finish();
        });
    }

    // Safety watchdog: If video stalls, fails to start, or exceeds expected length (15s), reveal website
    const watchdogTimer = setTimeout(() => {
      if (!hasFinishedRef.current) {
        console.warn("[IntroVideo] Max duration watchdog triggered, transitioning to website");
        triggerFadeOut();
      }
    }, 15000);

    return () => {
      clearTimeout(watchdogTimer);
    };
  }, [finish, triggerFadeOut]);

  if (state === "done") {
    return null;
  }

  const isFading = state === "fading";

  return (
    <div
      role="region"
      aria-label="Website introduction video"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? "none" : "auto",
        transition: `opacity ${fadeDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onPlay={() => setState("playing")}
        onEnded={() => triggerFadeOut()}
        onError={(e) => {
          console.error("[IntroVideo] Video error event occurred:", e);
          finish();
        }}
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          margin: 0,
          padding: 0,
          border: "none",
          outline: "none",
          backgroundColor: "#000000",
        }}
      />
    </div>
  );
}

export default IntroVideo;
