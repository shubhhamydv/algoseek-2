import React, { useRef, useState, useCallback, memo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Shield, Cpu, Database, Search, FileText, CheckCircle2, Zap } from "lucide-react";

interface HeroSectionProps {
  imageSrc?: string;
}

const PIPELINE_STEPS = [
  { id: "query", label: "Query", icon: Search },
  { id: "kb", label: "Knowledge Base", icon: FileText },
  { id: "retrieval", label: "Retrieval", icon: Zap },
  { id: "vectordb", label: "Vector Database", icon: Database },
  { id: "augmentation", label: "Augmentation", icon: Shield },
  { id: "llm", label: "LLM", icon: Cpu },
  { id: "answer", label: "Answer", icon: CheckCircle2 },
];

export const HeroSection = memo(function HeroSection({
  imageSrc = "/hero-rag-pipeline.png",
}: HeroSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Smooth spring physics for 3D perspective tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 22, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [5, -5]);
  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);
  const glareX = useTransform(smoothX, [0, 1], [0, 100]);
  const glareY = useTransform(smoothY, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    setActiveStep(null);
  }, [mouseX, mouseY]);

  return (
    <section className="hero-section-container">
      {/* Ambient background glow */}
      <div className="hero-ambient-glow" />

      <div className="hero-content-wrap">
        {/* Eyebrow & Title */}
        <motion.div
          className="hero-header-text"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>Architecture Overview</span>
          </div>
          <h1 className="hero-main-title font-cinzel">
            Grounded <span>RAG Pipeline</span>
          </h1>
          <p className="hero-main-subtitle">
            Hover over the pipeline to explore the end-to-end flow from query to verified source retrieval and grounded synthesis.
          </p>
        </motion.div>

        {/* 3D Interactive Card Frame */}
        <div
          className="hero-3d-stage"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            ref={cardRef}
            className={`hero-card-frame ${isHovered ? "is-hovered" : ""}`}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient Gold Aura Bloom */}
            <div className={`hero-card-aura ${isHovered ? "aura-active" : ""}`} />

            {/* Inner Content Container */}
            <div className="hero-card-inner">
              {/* Top Glass Badge Bar */}
              <div className="hero-card-topbar">
                <div className="hero-status-pill">
                  <span className="hero-status-dot" />
                  <span>Verified Grounding Architecture</span>
                </div>
                <div className="hero-badge-pill">
                  <Sparkles className="h-3 w-3 text-[#B8860B]" />
                  <span>Interactive Flow</span>
                </div>
              </div>

              {/* Static Hero Image */}
              <div className="hero-image-wrapper">
                <img
                  src={imageSrc}
                  alt="RAG Pipeline Architecture: Query, Knowledge Base, Retrieval, Vector Database, Augmentation, LLM, and Answer"
                  className="hero-rag-image"
                  loading="eager"
                  decoding="async"
                />

                {/* Interactive Dynamic Specular Glare */}
                <motion.div
                  className="hero-specular-glare"
                  style={{
                    opacity: isHovered ? 0.75 : 0,
                    background: useTransform(
                      [glareX, glareY],
                      ([x, y]) =>
                        `radial-gradient(circle 500px at ${x}% ${y}%, rgba(255, 255, 255, 0.45) 0%, rgba(245, 228, 183, 0.2) 35%, transparent 70%)`
                    ),
                  }}
                />

                {/* Subtle Glass Shimmer Edge */}
                <div className="hero-glass-edge-shimmer" />
              </div>

              {/* Interactive Step Ribbon */}
              <div className="hero-steps-ribbon">
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === idx;
                  return (
                    <div
                      key={step.id}
                      className={`hero-step-node ${isActive ? "active" : ""}`}
                      onMouseEnter={() => setActiveStep(idx)}
                    >
                      <div className="step-node-icon-wrap">
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="step-node-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;
