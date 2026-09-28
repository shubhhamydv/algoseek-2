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
 * - Guarantees that the video plays once and NEVER restarts or replays even for a second.
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
  const isFadingRef = useRef(false);
  const playAttemptedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Complete and unmount cleanly
  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }
    setState("done");
    onCompleteRef.current();
  }, []);

  // Trigger smooth fade out
  const triggerFadeOut = useCallback(() => {
    if (hasFinishedRef.current || isFadingRef.current) return;
    isFadingRef.current = true;

    // Immediately pause video so it freezes on the final frame and NEVER loops or restarts
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }

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
  }, [fadeDurationMs, finish]);

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

  // Programmatic autoplay and fallback watchdog - strictly runs ONCE on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video || playAttemptedRef.current) return;
    playAttemptedRef.current = true;

    // Ensure muted for strict browser autoplay policies
    video.muted = true;
    video.defaultMuted = true;

    // Try playing programmatically
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!hasFinishedRef.current && !isFadingRef.current) {
            setState("playing");
          }
        })
        .catch((error) => {
          console.warn("[IntroVideo] Autoplay prevented or failed, revealing website:", error);
          finish();
        });
    }

    // Safety watchdog: Video length is ~10s. If watchdog triggers after 12s, reveal website
    const watchdogTimer = setTimeout(() => {
      if (!hasFinishedRef.current && !isFadingRef.current) {
        console.warn("[IntroVideo] Max duration watchdog triggered, transitioning to website");
        triggerFadeOut();
      }
    }, 12000);

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
        loop={false}
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onPlay={() => {
          if (!hasFinishedRef.current && !isFadingRef.current) {
            setState("playing");
          }
        }}
        onTimeUpdate={() => {
          // Guard: if video is within 80ms of ending, trigger fade and pause so it cannot restart/loop
          const v = videoRef.current;
          if (v && v.duration > 0 && v.currentTime >= v.duration - 0.08) {
            triggerFadeOut();
          }
        }}
        onEnded={() => {
          triggerFadeOut();
        }}
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

      {/* Subtle Skip button */}
      <button
        type="button"
        onClick={triggerFadeOut}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 1000000,
          padding: "8px 18px",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          color: "#ffffff",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "9999px",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.05em",
          cursor: "pointer",
          transition: "all 0.2s ease",
          opacity: isFading ? 0 : 0.8,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = isFading ? "0" : "0.8";
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0, 0, 0, 0.45)";
        }}
      >
        Skip Intro
      </button>
    </div>
  );
}

export default IntroVideo;
