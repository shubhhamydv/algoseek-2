import React, { useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Layout,
  Server,
  Database,
  Code,
  BarChart3,
  Brain,
  GitBranch,
  Video,
  ListVideo,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LEARNING_CATEGORIES,
  LEARNING_RESOURCES,
  CategoryMetadata,
} from "@/data/learningResources";

const ICON_MAP = {
  Layout,
  Server,
  Database,
  Code,
  BarChart3,
  Brain,
  GitBranch,
};

export default function LearningHub() {
  const totalResources = useMemo(() => {
    return Object.values(LEARNING_RESOURCES).reduce(
      (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
      0
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1814] flex flex-col font-sans selection:bg-[#F3D279] selection:text-[#1C1814]">
      {/* ─── Atmospheric Golden Glow Background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[850px] h-[600px] bg-gradient-to-br from-[#E2B855]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[30%] left-[-10%] w-[650px] h-[650px] bg-gradient-to-tr from-[#C59A3F]/12 via-[#FAF7F2]/5 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] right-[20%] w-[750px] h-[550px] bg-gradient-to-t from-[#E2B855]/15 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ─── Top Header Bar ─── */}
      <header className="relative z-10 border-b border-[rgba(212,175,55,0.3)] bg-white/75 backdrop-blur-md sticky top-0 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#756858] hover:text-[#B8860B] transition-colors px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#FAF7F2] hover:bg-[#F5EFEB]"
              title="Return to Library Vault"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Library</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[rgba(212,175,55,0.25)]">
              <span className="font-regal text-sm font-bold tracking-tight text-[#1C1814]">
                ALGOSEEK
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F5E4B7] text-[#8C6208] border border-[rgba(212,175,55,0.4)]">
                Engineer Hub
              </span>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#756858]">
            <Link href="/library" className="hover:text-[#B8860B] transition-colors">
              Library
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#B8860B]" />
            <span className="font-bold text-[#1C1814]">Learning Hub</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#756858] hidden lg:inline-flex items-center gap-1.5 font-mono">
              <GraduationCap className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>{totalResources} Curated Courses</span>
            </span>

            <a
              href="/"
              className="text-xs font-bold text-[#1C1814] bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] hover:opacity-95 px-3.5 py-1.5 rounded-xl shadow-xs border border-[rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Tutor</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] border border-[rgba(212,175,55,0.4)] shadow-xs">
            <GraduationCap className="h-3.5 w-3.5 text-[#B8860B]" />
            <span className="text-xs font-bold tracking-widest uppercase font-regal text-[#8C6208]">
              FULL STACK & AI ROADMAPS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1814] font-regal tracking-tight leading-tight">
            Full Stack Engineer Hub
          </h1>

          <p className="text-base sm:text-lg text-[#756858] font-editorial leading-relaxed max-w-2xl mx-auto">
            Comprehensive learning pathways across every tier of modern software engineering.
            Explore curated masterclasses, project blueprints, and production playlists across 7 dedicated tracks.
          </p>
        </div>

        {/* ─── 7 Category Cards Responsive Grid ─── */}
        <section aria-label="Learning Tracks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEARNING_CATEGORIES.map((cat: CategoryMetadata, idx: number) => {
              const IconComponent = ICON_MAP[cat.iconName] || BookOpen;
              const resources = LEARNING_RESOURCES[cat.key] || [];
              const videoCount = resources.filter((r) => r.type === "video").length;
              const playlistCount = resources.filter((r) => r.type === "playlist").length;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                >
                  <Link
                    href={`/library/learning-hub/${cat.key}`}
                    className="group relative flex flex-col justify-between h-full rounded-3xl bg-white/95 border border-[rgba(212,175,55,0.32)] hover:border-[#B8860B] shadow-[0_10px_30px_rgba(28,24,20,0.04)] hover:shadow-[0_16px_40px_rgba(184,134,11,0.14)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 sm:p-7 block cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:ring-offset-2"
                  >
                    {/* Golden top accent bar on hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div>
                      {/* Card Header with Icon and Resource Pill */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF3E8] border border-[rgba(212,175,55,0.4)] flex items-center justify-center text-[#B8860B] group-hover:scale-105 group-hover:bg-[#F5E4B7] transition-all">
                          <IconComponent className="h-6 w-6" />
                        </div>

                        <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#8C6208] border border-[rgba(212,175,55,0.3)]">
                          {resources.length} {resources.length === 1 ? "Resource" : "Resources"}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h2 className="text-xl font-bold font-serif text-[#1C1814] group-hover:text-[#B8860B] transition-colors leading-snug">
                        {cat.title}
                      </h2>

                      <p className="text-xs font-semibold text-[#8C6208] mt-1 font-mono">
                        {cat.subtitle}
                      </p>

                      <p className="text-xs text-[#756858] leading-relaxed mt-3 line-clamp-3">
                        {cat.description}
                      </p>
                    </div>

                    {/* Card Footer with Meta & Enter Link */}
                    <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.25)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[#756858] text-[11px] font-mono">
                        {playlistCount > 0 && (
                          <span className="flex items-center gap-1">
                            <ListVideo className="h-3 w-3 text-[#B8860B]" />
                            <span>{playlistCount} {playlistCount === 1 ? "Playlist" : "Playlists"}</span>
                          </span>
                        )}
                        {playlistCount > 0 && videoCount > 0 && <span>•</span>}
                        {videoCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3 text-[#B8860B]" />
                            <span>{videoCount} {videoCount === 1 ? "Video" : "Videos"}</span>
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 font-bold text-[#B8860B] group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── Bottom Navigation Callout ─── */}
        <div className="mt-14 text-center p-6 rounded-3xl bg-white/70 border border-[rgba(212,175,55,0.3)] max-w-xl mx-auto shadow-xs">
          <BookOpen className="h-5 w-5 text-[#B8860B] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#1C1814] font-regal">
            Looking for Cheatsheets and Interview Sheets?
          </h4>
          <p className="text-xs text-[#756858] mt-1 leading-relaxed">
            Access 13+ verified handwritten PDF notes, Google-tagged problem sheets, and pattern recognition guides in the Vault.
          </p>
          <div className="mt-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B8860B] hover:text-[#8C6208] transition-colors"
            >
              <span>Browse Library Vault Sheets</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
