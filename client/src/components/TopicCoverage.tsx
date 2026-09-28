import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Compass,
  CheckCircle2,
  TrendingUp,
  Zap,
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
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF1DF] border border-[rgba(212,175,55,0.45)] hover:border-[#B8860B] text-xs font-semibold text-[#1C1814] transition-all shadow-sm group"
      title="View DSA Curriculum Coverage Map"
    >
      <div className="flex items-center gap-1.5 text-[#B8860B]">
        <Compass className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
        <span className="font-regal">Curriculum:</span>
      </div>
      <span className="font-bold text-[#1C1814]">
        {exploredCount}/{totalTopics}
      </span>
      <div className="w-12 h-2 bg-[#F4ECE1] rounded-full overflow-hidden ml-0.5">
        <div
          className="h-full bg-gradient-to-r from-[#B8860B] to-[#E2B855] rounded-full transition-all duration-500"
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
        className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FAF7F2]/95 border border-[rgba(212,175,55,0.45)] text-[#1C1814] shadow-2xl backdrop-blur-md"
      >
        <div
          className={`p-2 rounded-xl ${
            isPracticed
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-[#FBF2DE] text-[#B8860B] border border-[rgba(212,175,55,0.4)]"
          }`}
        >
          {isPracticed ? <CheckCircle2 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="text-xs">
          <div className="font-bold text-[#1C1814]">{transition.topicTitle}</div>
          <div className={isPracticed ? "text-emerald-700 font-semibold" : "text-[#B8860B] font-semibold"}>
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1814]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-[#FAF7F2]/95 border border-[rgba(212,175,55,0.45)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1C1814]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.25)] bg-[#F8F3EA]/90">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FBF2DE] border border-[rgba(212,175,55,0.45)] text-[#B8860B]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-regal font-extrabold text-[#1C1814] text-lg">DSA Topic Coverage Map</h3>
                <p className="text-xs text-[#756858]">
                  Track your learning progress across all 12 canonical DSA patterns
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#756858] hover:text-[#1C1814] rounded-xl hover:bg-[#F3EBDD] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-3 bg-[#F4ECE1] border-b border-[rgba(212,175,55,0.25)] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[#756858]">Total Coverage: </span>
                <span className="font-bold text-[#1C1814] ml-1">{exploredCount} / {topics.length} Patterns</span>
              </div>
              <div>
                <span className="text-[#756858]">Mastered: </span>
                <span className="font-bold text-emerald-600 ml-1">{practicedCount} Practiced</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="inline-flex items-center gap-1.5 text-[#756858]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4C7B5] inline-block" /> Not Started
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#B8860B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B] inline-block" /> Explored
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Practiced
              </span>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-[#FAF7F2]">
            {topics.map((topic) => {
              const rec = progress[topic.id];
              const tier = rec?.tier || "not_started";
              const isPracticed = tier === "practiced";
              const isExplored = tier === "explored";

              let cardBorder = "border-[rgba(212,175,55,0.25)] bg-[#FFFDF9] hover:border-[#B8860B]";
              let badgeColor = "bg-[#F3EBDD] text-[#756858] border-[rgba(212,175,55,0.25)]";
              let badgeText = "Not Started";

              if (isPracticed) {
                cardBorder = "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400";
                badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
                badgeText = "Practiced ✓";
              } else if (isExplored) {
                cardBorder = "border-[rgba(212,175,55,0.45)] bg-[#FDF9F0] hover:border-[#B8860B]";
                badgeColor = "bg-[#FBF2DE] text-[#B8860B] border-[rgba(212,175,55,0.45)] font-bold";
                badgeText = "Explored";
              }

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${cardBorder}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-regal font-bold text-[#1C1814] text-sm leading-tight">
                        {topic.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-[#756858] leading-relaxed line-clamp-2">
                      {topic.shortDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[rgba(212,175,55,0.2)] flex items-center justify-between text-xs text-[#756858]">
                    <span className="font-medium">{topic.lectureIds?.length || 0} Lectures</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectTopic(topic)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF1DF] border border-[rgba(212,175,55,0.35)] text-[#1C1814] hover:text-[#B8860B] transition-colors text-[11px] font-semibold"
                      >
                        Ask Tutor
                      </button>
                      <button
                        onClick={() => onStartQuiz(topic)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#E2B855] text-[#1C1814] font-bold flex items-center gap-1 shadow-xs hover:shadow-sm transition-all text-[11px]"
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
          <div className="px-6 py-3.5 border-t border-[rgba(212,175,55,0.25)] bg-[#F8F3EA]/90 flex justify-between items-center text-xs text-[#756858]">
            <span>Interactions and quizzes automatically update your curriculum progress.</span>
            <Button onClick={onClose} variant="outline" className="border-[rgba(212,175,55,0.4)] rounded-xl text-xs h-8 text-[#1C1814] hover:bg-[#FAF1DF]">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
