import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";

export interface TopicItem {
  id: string;
  title: string;
  shortDesc: string;
  keywords: string[];
  lectureIds: string[];
}

export type TopicTier = "not_started" | "explored" | "practiced";

export interface TopicProgressRecord {
  topicId: string;
  tier: TopicTier;
  interactions: number;
  quizzesCompleted: number;
  lastUpdated: number;
}

const STORAGE_KEY = "unstuck_dsa_topic_progress_v1";

// Helper hook for topic progress
export function useTopicProgress(topics: TopicItem[] = []) {
  const [progress, setProgress] = useState<Record<string, TopicProgressRecord>>({});
  const [recentTransition, setRecentTransition] = useState<{
    topicTitle: string;
    newTier: TopicTier;
  } | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProgress(JSON.parse(raw));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to local storage
  const saveProgress = (newProgress: Record<string, TopicProgressRecord>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // Ignore
    }
  };

  const recordInteraction = useCallback(
    (topicId: string, type: "query" | "citation_click" | "quiz_completed") => {
      if (!topicId) return;

      const current = progress[topicId] || {
        topicId,
        tier: "not_started" as TopicTier,
        interactions: 0,
        quizzesCompleted: 0,
        lastUpdated: Date.now(),
      };

      const newInteractions = current.interactions + (type === "quiz_completed" ? 0 : 1);
      const newQuizzes = current.quizzesCompleted + (type === "quiz_completed" ? 1 : 0);

      let newTier: TopicTier = "not_started";
      if (newQuizzes > 0 || newInteractions >= 3) {
        newTier = "practiced";
      } else if (newInteractions >= 1) {
        newTier = "explored";
      }

      // Check if tier transitioned
      if (newTier !== current.tier) {
        const topicObj = topics.find((t) => t.id === topicId);
        const title = topicObj?.title || topicId;
        setRecentTransition({ topicTitle: title, newTier });
        setTimeout(() => setRecentTransition(null), 2400);
      }

      const updated: Record<string, TopicProgressRecord> = {
        ...progress,
        [topicId]: {
          topicId,
          tier: newTier,
          interactions: newInteractions,
          quizzesCompleted: newQuizzes,
          lastUpdated: Date.now(),
        },
      };

      saveProgress(updated);
    },
    [progress, topics]
  );

  // Stats calculation
  const totalTopics = topics.length || 12;
  const exploredCount = Object.values(progress).filter(
    (p) => p.tier === "explored" || p.tier === "practiced"
  ).length;
  const practicedCount = Object.values(progress).filter((p) => p.tier === "practiced").length;

  return {
    progress,
    exploredCount,
    practicedCount,
    totalTopics,
    recordInteraction,
    recentTransition,
  };
}

// 1. Compact Persistent Badge
export function TopicCoverageBadge({
  exploredCount,
  totalTopics,
  onClick,
}: {
  exploredCount: number;
  totalTopics: number;
  onClick: () => void;
}) {
  const percent = Math.round((exploredCount / Math.max(1, totalTopics)) * 100);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b1c24] hover:bg-[#232530] border border-amber-500/20 hover:border-amber-500/40 text-xs font-medium text-zinc-200 transition-all shadow-sm group"
      title="View DSA Curriculum Coverage Map"
    >
      <div className="flex items-center gap-1.5 text-amber-400">
        <Compass className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
        <span>Curriculum:</span>
      </div>
      <span className="font-semibold text-white">
        {exploredCount}/{totalTopics}
      </span>
      <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden ml-0.5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </button>
  );
}

// 2. Auto-Dismissing Toast Notification for Tier Transitions
export function TopicTransitionToast({
  transition,
}: {
  transition: { topicTitle: string; newTier: TopicTier } | null;
}) {
  if (!transition) return null;

  const isPracticed = transition.newTier === "practiced";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#161720] border border-amber-500/30 text-white shadow-2xl backdrop-blur-md"
      >
        <div
          className={`p-1.5 rounded-lg ${
            isPracticed
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {isPracticed ? <CheckCircle2 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="text-xs">
          <div className="font-semibold text-zinc-100">{transition.topicTitle}</div>
          <div className={isPracticed ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
            Tier updated: {isPracticed ? "Practiced ✓" : "Explored ✓"}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 3. Full Slide-Over Topic Grid Modal
export function TopicCoverageModal({
  isOpen,
  onClose,
  topics,
  progress,
  onSelectTopic,
  onStartQuiz,
}: {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicItem[];
  progress: Record<string, TopicProgressRecord>;
  onSelectTopic: (topic: TopicItem) => void;
  onStartQuiz: (topic: TopicItem) => void;
}) {
  if (!isOpen) return null;

  const exploredCount = Object.values(progress).filter(
    (p) => p.tier === "explored" || p.tier === "practiced"
  ).length;
  const practicedCount = Object.values(progress).filter((p) => p.tier === "practiced").length;
  const percent = Math.round((exploredCount / Math.max(1, topics.length)) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-[#13141a] border border-[#272935] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#242630] bg-[#171822]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">DSA Topic Coverage Map</h3>
                <p className="text-xs text-zinc-400">
                  Track your learning progress across all 12 canonical DSA patterns
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-3.5 bg-[#1a1b24] border-b border-[#242630] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-zinc-400">Total Coverage: </span>
                <span className="font-bold text-white ml-1">{exploredCount} / {topics.length} Patterns</span>
              </div>
              <div>
                <span className="text-zinc-400">Mastered: </span>
                <span className="font-bold text-emerald-400 ml-1">{practicedCount} Practiced</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" /> Not Started
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-2" /> Explored
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-2" /> Practiced
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {topics.map((topic) => {
              const rec = progress[topic.id];
              const tier = rec?.tier || "not_started";
              const isPracticed = tier === "practiced";
              const isExplored = tier === "explored";

              let cardBorder = "border-zinc-800/80 bg-[#161720] hover:border-zinc-700";
              let badgeColor = "bg-zinc-800 text-zinc-400 border-zinc-700";
              let badgeText = "Not Started";

              if (isPracticed) {
                cardBorder = "border-emerald-500/30 bg-[#131d18] hover:border-emerald-500/50";
                badgeColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 font-medium";
                badgeText = "Practiced ✓";
              } else if (isExplored) {
                cardBorder = "border-amber-500/30 bg-[#1d1a14] hover:border-amber-500/50";
                badgeColor = "bg-amber-950/60 text-amber-300 border-amber-500/30 font-medium";
                badgeText = "Explored";
              }

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${cardBorder}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-white text-sm leading-tight">
                        {topic.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {topic.shortDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                    <span>{topic.lectureIds?.length || 0} Lectures</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectTopic(topic)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors text-[11px] font-medium"
                      >
                        Ask Tutor
                      </button>
                      <button
                        onClick={() => onStartQuiz(topic)}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors text-[11px] font-medium flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" /> Quiz
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-[#242630] bg-[#171822] flex justify-between items-center text-xs text-zinc-400">
            <span>Interactions and quizzes automatically update your mastery.</span>
            <Button onClick={onClose} variant="outline" className="border-zinc-700 text-xs h-8">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
