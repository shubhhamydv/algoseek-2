import React, { useMemo, useState, memo } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Video,
  ListVideo,
  Layout,
  Server,
  Database,
  Code,
  BarChart3,
  Brain,
  GitBranch,
  BookOpen,
  Play,
  Clock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LEARNING_CATEGORIES,
  LEARNING_RESOURCES,
  CategoryKey,
  LearningResource,
} from "@/data/learningResources";
import {
  parseYouTubeUrl,
  DEFAULT_THUMBNAIL_PLACEHOLDER,
} from "@/lib/youtubeHelper";

const ICON_MAP = {
  Layout,
  Server,
  Database,
  Code,
  BarChart3,
  Brain,
  GitBranch,
};

// Memoized Resource Card for optimal rendering and zero layout shift
interface ResourceCardProps {
  resource: LearningResource;
  index: number;
}

const ResourceCard = memo(function ResourceCard({ resource, index }: ResourceCardProps) {
  const parsed = useMemo(
    () => parseYouTubeUrl(resource.url, resource.type, resource.thumbnailUrl),
    [resource.url, resource.type, resource.thumbnailUrl]
  );

  const [imgSrc, setImgSrc] = useState<string>(parsed.thumbnailUrl);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  const handleImageError = () => {
    if (!imgFailed) {
      setImgFailed(true);
      setImgSrc(DEFAULT_THUMBNAIL_PLACEHOLDER);
    }
  };

  const isPlaylist = resource.type === "playlist" || parsed.type === "playlist";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group flex flex-col justify-between rounded-3xl bg-white/95 border border-[rgba(212,175,55,0.32)] hover:border-[#B8860B] shadow-[0_10px_30px_rgba(28,24,20,0.04)] hover:shadow-[0_16px_40px_rgba(184,134,11,0.14)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* ─── Thumbnail Container (Strict 16:9 Aspect Ratio) ─── */}
      <div className="relative aspect-video w-full bg-[#1C1814] overflow-hidden">
        <img
          src={imgSrc}
          alt={resource.title}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Badge: Video / Playlist */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isPlaylist ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-purple-900/85 text-purple-200 border border-purple-400/40 backdrop-blur-md shadow-sm">
              <ListVideo className="h-3 w-3" />
              <span>Playlist</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-amber-900/85 text-amber-200 border border-amber-400/40 backdrop-blur-md shadow-sm">
              <Video className="h-3 w-3" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Play Icon Pill on Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-[#B8860B]/90 text-[#1C1814] flex items-center justify-center shadow-lg border border-[#F5E4B7] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration / Lectures Tag if available */}
        {resource.duration && (
          <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-white/90 backdrop-blur-sm border border-white/10">
            {resource.duration}
          </div>
        )}
      </div>

      {/* ─── Card Body ─── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {resource.channel && (
            <div className="flex items-center gap-1.5 text-xs text-[#8C6208] font-semibold mb-1.5">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{resource.channel}</span>
            </div>
          )}

          <h3 className="text-base font-bold font-serif text-[#1C1814] group-hover:text-[#B8860B] transition-colors leading-snug line-clamp-2">
            {resource.title}
          </h3>
        </div>

        {/* ─── Card Actions ─── */}
        <div className="mt-5 pt-3.5 border-t border-[rgba(212,175,55,0.2)] flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#756858]">
            YouTube {isPlaylist ? "Series" : "Masterclass"}
          </span>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] text-[#1C1814] shadow-xs hover:shadow-md transition-all border border-[rgba(212,175,55,0.4)]"
            title={`Watch "${resource.title}" on YouTube`}
          >
            <span>Watch Now</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.article>
  );
});

export default function LearningHubCategory() {
  const params = useParams<{ category: string }>();
  const categoryKey = (params.category || "").toLowerCase() as CategoryKey;

  const categoryMeta = useMemo(() => {
    return LEARNING_CATEGORIES.find(
      (c) => c.key.toLowerCase() === categoryKey
    );
  }, [categoryKey]);

  const resources = useMemo(() => {
    if (!categoryMeta) return [];
    return LEARNING_RESOURCES[categoryMeta.key] || [];
  }, [categoryMeta]);

  // Invalid category fallback state
  if (!categoryMeta) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1814] flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="h-12 w-12 text-[#C59A3F] mb-4 opacity-60" />
        <h1 className="text-2xl font-bold font-regal text-[#1C1814]">Category Not Found</h1>
        <p className="text-sm text-[#756858] mt-2 max-w-md">
          The requested track does not exist in our learning roadmaps. Please choose from our 7 curated engineering sections.
        </p>
        <Link
          href="/library/learning-hub"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] to-[#E2B855] text-[#1C1814] shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to KHAZAANA</span>
        </Link>
      </div>
    );
  }

  const IconComponent = ICON_MAP[categoryMeta.iconName] || BookOpen;

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
              href="/library/learning-hub"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#756858] hover:text-[#B8860B] transition-colors px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#FAF7F2] hover:bg-[#F5EFEB]"
              title="Return to KHAZAANA"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>KHAZAANA</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[rgba(212,175,55,0.25)]">
              <span className="font-regal text-sm font-bold tracking-tight text-[#1C1814]">
                ALGOSEEK
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F5E4B7] text-[#8C6208] border border-[rgba(212,175,55,0.4)]">
                {categoryMeta.title}
              </span>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#756858]">
            <Link href="/library" className="hover:text-[#B8860B] transition-colors">
              Library
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#B8860B]" />
            <Link href="/library/learning-hub" className="hover:text-[#B8860B] transition-colors">
              KHAZAANA
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#B8860B]" />
            <span className="font-bold text-[#1C1814]">{categoryMeta.title}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#756858] hidden lg:inline-flex items-center gap-1.5 font-mono">
              <GraduationCap className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>{resources.length} Verified Resources</span>
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
        {/* Category Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] border border-[rgba(212,175,55,0.4)] shadow-xs">
            <IconComponent className="h-3.5 w-3.5 text-[#B8860B]" />
            <span className="text-xs font-bold tracking-widest uppercase font-regal text-[#8C6208]">
              {categoryMeta.subtitle}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1814] font-regal tracking-tight leading-tight">
            {categoryMeta.title} Engineering
          </h1>

          <p className="text-base sm:text-lg text-[#756858] font-editorial leading-relaxed max-w-2xl mx-auto">
            {categoryMeta.description}
          </p>
        </div>

        {/* ─── Resource Grid / Empty State ─── */}
        {resources.length === 0 ? (
          <div className="text-center py-16 bg-white/70 rounded-3xl border border-dashed border-[rgba(212,175,55,0.4)] p-8 max-w-xl mx-auto">
            <BookOpen className="h-10 w-10 text-[#C59A3F] mx-auto mb-3 opacity-60" />
            <h2 className="text-lg font-bold text-[#1C1814] font-regal">
              Resources coming soon
            </h2>
            <p className="text-xs text-[#756858] mt-1 max-w-sm mx-auto">
              Curated masterclasses and playlists are currently being selected for this track. Check back shortly.
            </p>
            <div className="mt-4">
              <Link
                href="/library/learning-hub"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] hover:bg-[#F5EFEB] text-[#1C1814] border border-[rgba(212,175,55,0.35)] transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Explore Other Tracks</span>
              </Link>
            </div>
          </div>
        ) : (
          <section aria-label={`${categoryMeta.title} Resources`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource: LearningResource, idx: number) => (
                <ResourceCard
                  key={`${resource.url}-${idx}`}
                  resource={resource}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Quick Track Switcher Bar ─── */}
        <div className="mt-14 pt-8 border-t border-[rgba(212,175,55,0.25)]">
          <p className="text-center text-xs font-bold uppercase tracking-wider font-regal text-[#8C6208] mb-4">
            Explore Other Engineering Tracks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LEARNING_CATEGORIES.map((c) => {
              const active = c.key.toLowerCase() === categoryKey;
              return (
                <Link
                  key={c.key}
                  href={`/library/learning-hub/${c.key}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] text-[#1C1814] font-bold shadow-xs border border-[rgba(212,175,55,0.4)]"
                      : "bg-white/80 hover:bg-white text-[#756858] hover:text-[#1C1814] border border-[rgba(212,175,55,0.25)]"
                  }`}
                >
                  {c.title}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
