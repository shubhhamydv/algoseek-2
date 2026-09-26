import { useEffect, useRef, useState } from "react";

const DESKTOP_FRAME_COUNT = 150;
const MOBILE_FRAME_COUNT = 75;
const MAX_FRAME_CACHE = 14;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function isConstrainedDevice() {
  if (typeof window === "undefined") return false;
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  return window.matchMedia("(max-width: 700px)").matches
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
    || (navigatorWithMemory.deviceMemory !== undefined && navigatorWithMemory.deviceMemory <= 4);
}

function frameUrl(variant: "desktop" | "mobile", index: number) {
  return `/rag-sequence/${variant}/frame-${index.toString().padStart(3, "0")}.webp`;
}

export function RagScrollSection({ hero = false }: { hero?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef(new Map<number, HTMLImageElement>());
  const pendingRef = useRef(new Set<number>());
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const renderedFrameRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const constrained = isConstrainedDevice();
    const variant = constrained ? "mobile" : "desktop";
    const frameCount = constrained ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const draw = (image: HTMLImageElement) => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, constrained ? 1.25 : 2);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#050a14";
      context.fillRect(0, 0, width, height);
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawnWidth = image.naturalWidth * scale;
      const drawnHeight = image.naturalHeight * scale;
      context.drawImage(image, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
    };

    const trimCache = (center: number) => {
      if (framesRef.current.size <= MAX_FRAME_CACHE) return;
      const removable = Array.from(framesRef.current.keys())
        .filter((index) => index !== 0 && index !== frameCount - 1)
        .sort((a, b) => Math.abs(b - center) - Math.abs(a - center));

      while (framesRef.current.size > MAX_FRAME_CACHE && removable.length) {
        const index = removable.shift();
        if (index === undefined) break;
        const image = framesRef.current.get(index);
        if (image) image.src = "";
        framesRef.current.delete(index);
      }
    };

    const loadFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(frameCount - 1, index));
      if (framesRef.current.has(safeIndex) || pendingRef.current.has(safeIndex)) return;

      pendingRef.current.add(safeIndex);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        pendingRef.current.delete(safeIndex);
        framesRef.current.set(safeIndex, image);
        if (safeIndex === 0) setIsReady(true);
        const currentIndex = Math.round(currentProgressRef.current * (frameCount - 1));
        if (safeIndex === currentIndex || safeIndex === 0) draw(image);
      };
      image.onerror = () => pendingRef.current.delete(safeIndex);
      image.src = frameUrl(variant, safeIndex);
    };

    const warmFrames = (index: number) => {
      const nearby = [-2, -1, 0, 1, 2, 3, 5];
      nearby.forEach((offset) => loadFrame(index + offset));
      loadFrame(0);
      if (index > frameCount - 8) loadFrame(frameCount - 1);
      trimCache(index);
    };

    const renderProgress = (progress: number) => {
      const index = Math.round(progress * (frameCount - 1));
      warmFrames(index);
      const image = framesRef.current.get(index);
      if (image && renderedFrameRef.current !== index) {
        renderedFrameRef.current = index;
        draw(image);
        return;
      }

      if (!image) {
        const nearest = Array.from(framesRef.current.keys()).sort((a, b) => Math.abs(a - index) - Math.abs(b - index))[0];
        if (nearest !== undefined && renderedFrameRef.current !== nearest) {
          renderedFrameRef.current = nearest;
          draw(framesRef.current.get(nearest)!);
        }
      }
    };

    const updateTarget = () => {
      const top = section.getBoundingClientRect().top;
      const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      targetProgressRef.current = clamp(-top / scrollableDistance);
      if (animationFrameRef.current === null) animationFrameRef.current = requestAnimationFrame(tick);
    };

    const tick = () => {
      const difference = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current = Math.abs(difference) < 0.001
        ? targetProgressRef.current
        : currentProgressRef.current + difference * 0.16;
      renderProgress(currentProgressRef.current);

      if (Math.abs(targetProgressRef.current - currentProgressRef.current) > 0.001) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
      }
    };

    const redraw = () => {
      const index = Math.round(currentProgressRef.current * (frameCount - 1));
      const image = framesRef.current.get(index) ?? framesRef.current.get(0);
      if (image) draw(image);
    };

    const resizeObserver = new ResizeObserver(redraw);
    resizeObserver.observe(canvas);
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });
    loadFrame(0);
    warmFrames(0);
    updateTarget();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      framesRef.current.forEach((image) => { image.src = ""; });
      framesRef.current.clear();
      pendingRef.current.clear();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className={`rag-scroll-section rag-reduced-motion ${hero ? "rag-hero-scroll-section" : ""}`} aria-labelledby="rag-title">
        <div className="rag-static-frame">
          <div className="rag-section-label"><span>How RAG works</span><p>Retrieve. Augment. Generate.</p></div>
          <img src={frameUrl("mobile", 0)} alt="RAG architecture from query through answer generation" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={`rag-scroll-section ${hero ? "rag-hero-scroll-section" : ""}`} aria-labelledby="rag-title">
      <div className="rag-sticky-container">
        <div className="rag-section-label">
          <span id="rag-title">How RAG works</span>
          <p>Scroll to explore the grounded-answer pipeline.</p>
        </div>
        <div className={`rag-frame-shell ${isReady ? "is-ready" : ""}`}>
          <canvas ref={canvasRef} className="rag-frame-canvas" role="img" aria-label="Scroll-controlled visualization of a RAG pipeline from query to answer" />
          {!isReady && <span className="rag-loading" aria-live="polite">Preparing visualization…</span>}
        </div>
      </div>
    </section>
  );
}
