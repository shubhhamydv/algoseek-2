import React, { useState, useMemo, useEffect } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Code2,
  Sparkles,
  Layers,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DSA_PATTERNS,
  ALL_PRACTICE_PROBLEMS,
  searchPracticeProblems,
  PracticeProblem,
  PatternGroup,
} from "@/data/dsaPatterns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PracticeSectionProps {
  searchQuery: string;
  onSelectTopic?: (topic: string) => void;
}

export function PracticeSection({ searchQuery, onSelectTopic }: PracticeSectionProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "Easy" | "Medium" | "Hard">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // When searchQuery changes from parent, sync pattern selection if it matches a pattern
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return;
    }
    const matched = DSA_PATTERNS.find(
      (p) =>
        p.name.toLowerCase() === q ||
        q.includes(p.name.toLowerCase()) ||
        p.id === q
    );
    if (matched) {
      setSelectedPatternId(matched.id);
    } else {
      setSelectedPatternId("all");
    }
  }, [searchQuery]);

  // Compute search results
  const searchResults = useMemo(() => {
    return searchPracticeProblems(searchQuery);
  }, [searchQuery]);

  // Filter problems based on selected pattern and difficulty
  const filteredProblems = useMemo(() => {
    let pool: PracticeProblem[];

    if (searchQuery.trim()) {
      // Use search results
      pool = searchResults.matchedProblems;
      if (selectedPatternId !== "all") {
        const pat = DSA_PATTERNS.find((p) => p.id === selectedPatternId);
        if (pat) {
          pool = pool.filter((prob) => prob.pattern === pat.name);
        }
      }
    } else if (selectedPatternId !== "all") {
      const pat = DSA_PATTERNS.find((p) => p.id === selectedPatternId);
      pool = pat ? pat.problems : ALL_PRACTICE_PROBLEMS;
    } else {
      pool = ALL_PRACTICE_PROBLEMS;
    }

    if (selectedDifficulty !== "all") {
      pool = pool.filter((prob) => prob.difficulty === selectedDifficulty);
    }

    return pool;
  }, [searchQuery, searchResults, selectedPatternId, selectedDifficulty]);

  // Group filtered problems by pattern for organized display
  const groupedDisplay = useMemo(() => {
    const map = new Map<string, PracticeProblem[]>();
    for (const prob of filteredProblems) {
      if (!map.has(prob.pattern)) {
        map.set(prob.pattern, []);
      }
      map.get(prob.pattern)!.push(prob);
    }
    return Array.from(map.entries()).map(([patternName, items]) => {
      const groupMeta = DSA_PATTERNS.find((p) => p.name === patternName);
      return {
        patternName,
        meta: groupMeta,
        items,
      };
    });
  }, [filteredProblems]);

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const currentPatternMeta = useMemo(() => {
    if (selectedPatternId === "all") return null;
    return DSA_PATTERNS.find((p) => p.id === selectedPatternId) || null;
  }, [selectedPatternId]);

  return (
    <div className="practice-sheet-container w-full space-y-6">
      {/* ─── Top Stats & Info Bar ─── */}
      <div className="bg-white/80 backdrop-blur-md border border-[rgba(212,175,55,0.35)] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAF1DF] text-[#B8860B]">
                <Code2 className="h-5 w-5" />
              </span>
              <h3 className="font-regal text-xl font-bold text-[#1C1814]">
                DSA Pattern Practice Sheet
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF1DF] text-[#8C6208] border border-[rgba(212,175,55,0.35)]">
                193 Problems
              </span>
            </div>
            <p className="text-xs text-[#6B5E51]">
              Every problem categorized by fundamental algorithmic pattern with direct verified links to LeetCode and GeeksforGeeks.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick stats pills */}
            <div className="flex items-center gap-1.5 text-xs text-[#8C6208] bg-[#FFFBF2] border border-[rgba(212,175,55,0.3)] px-3 py-1.5 rounded-xl font-medium">
              <Layers className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>16 Patterns</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#1E7E34] bg-[#E8F5E9] border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct Link Verified</span>
            </div>
          </div>
        </div>

        {/* ─── Pattern Navigation Pills ─── */}
        <div className="mt-4 pt-4 border-t border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C6208] flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Browse by Pattern:
            </span>
            {(selectedPatternId !== "all" || selectedDifficulty !== "all" || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPatternId("all");
                  setSelectedDifficulty("all");
                  if (onSelectTopic) onSelectTopic("");
                }}
                className="text-xs font-semibold text-[#B8860B] hover:text-[#8C6208] inline-flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedPatternId("all")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPatternId === "all"
                  ? "bg-[#B8860B] text-white shadow-sm"
                  : "bg-white text-[#1C1814] border border-[rgba(212,175,55,0.3)] hover:border-[#B8860B] hover:bg-[#FAF1DF]/50"
              }`}
            >
              All Patterns ({ALL_PRACTICE_PROBLEMS.length})
            </button>

            {DSA_PATTERNS.map((p) => {
              const isActive = selectedPatternId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatternId(p.id);
                    if (onSelectTopic && searchQuery && searchQuery.toLowerCase() !== p.name.toLowerCase()) {
                      onSelectTopic(p.name);
                    }
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#B8860B] text-white shadow-sm"
                      : "bg-white text-[#1C1814] border border-[rgba(212,175,55,0.3)] hover:border-[#B8860B] hover:bg-[#FAF1DF]/50"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FAF1DF] text-[#8C6208]"
                  }`}>
                    {p.problemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Difficulty Filter Bar ─── */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-[#6B5E51]">Difficulty:</span>
          {(["all", "Easy", "Medium", "Hard"] as const).map((diff) => {
            const isActive = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? diff === "Easy"
                      ? "bg-emerald-600 text-white"
                      : diff === "Medium"
                      ? "bg-amber-600 text-white"
                      : diff === "Hard"
                      ? "bg-rose-600 text-white"
                      : "bg-[#1C1814] text-white"
                    : "bg-white text-[#524636] border border-[rgba(212,175,55,0.25)] hover:bg-[#FAF1DF]/40"
                }`}
              >
                {diff === "all" ? "All Levels" : diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Pattern Spotlight / Overview banner when a pattern is selected ─── */}
      {currentPatternMeta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FAF1DF] via-white to-[#FAF1DF] border border-[rgba(212,175,55,0.4)] rounded-2xl p-5 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-regal text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                  Selected Pattern
                </span>
                <span className="text-xs bg-[#B8860B]/10 text-[#8C6208] px-2 py-0.5 rounded-full font-semibold">
                  {currentPatternMeta.problemCount} Problems
                </span>
              </div>
              <h2 className="font-regal text-2xl font-bold text-[#1C1814] mt-0.5">
                {currentPatternMeta.name}
              </h2>
              <p className="text-sm text-[#524636] mt-1 max-w-2xl">
                {currentPatternMeta.description}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPatternId("all")}
                className="text-xs border-[rgba(212,175,55,0.4)] hover:bg-[#FAF1DF]"
              >
                Show All Patterns
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Search Results Context Banner ─── */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between bg-white border border-[rgba(212,175,55,0.3)] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-[#1C1814]">
            <Search className="h-4 w-4 text-[#B8860B]" />
            <span>
              Searching for <strong>"{searchQuery}"</strong> —{" "}
              <span className="text-[#8C6208] font-semibold">{filteredProblems.length}</span> problem{filteredProblems.length === 1 ? "" : "s"} found
            </span>
          </div>
          {onSelectTopic && (
            <button
              type="button"
              onClick={() => onSelectTopic("")}
              className="text-xs text-[#B8860B] hover:text-[#8C6208] font-semibold underline underline-offset-2"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* ─── Problem Cards List Grouped by Pattern ─── */}
      {groupedDisplay.length > 0 ? (
        <div className="space-y-6">
          {groupedDisplay.map(({ patternName, meta, items }) => (
            <div key={patternName} className="space-y-3">
              {/* Pattern Group Header (only when viewing multiple patterns) */}
              {selectedPatternId === "all" && (
                <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.25)] pb-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#B8860B]" />
                    <h4 className="font-regal text-base font-bold text-[#1C1814]">
                      {patternName}
                    </h4>
                    <span className="text-xs text-[#8C6208] bg-[#FAF1DF] px-2 py-0.5 rounded-full font-medium">
                      {items.length} problem{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatternId(meta?.id || "all")}
                    className="text-xs text-[#B8860B] hover:text-[#8C6208] font-semibold inline-flex items-center gap-1 group"
                  >
                    <span>Focus pattern</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {/* Grid of Problem Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((prob, idx) => {
                  const primaryLink = prob.links[0]?.url || "";
                  return (
                    <motion.div
                      key={prob.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                      className="bg-white border border-[rgba(212,175,55,0.3)] hover:border-[#B8860B] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        {/* Tags Row */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-[#8C6208] bg-[#FAF1DF] px-2 py-0.5 rounded-md">
                              {prob.pattern}
                            </span>
                            {prob.subCategory && (
                              <span className="text-[11px] font-medium text-[#6B5E51] bg-[#F7F4EE] px-2 py-0.5 rounded-md border border-[rgba(212,175,55,0.2)]">
                                {prob.subCategory}
                              </span>
                            )}
                          </div>

                          {prob.difficulty && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                          )}
                        </div>

                        {/* Problem Title */}
                        <h4 className="font-regal text-base font-semibold text-[#1C1814] group-hover:text-[#8C6208] transition-colors leading-snug">
                          {prob.title}
                        </h4>
                      </div>

                      {/* Direct Links Action Row */}
                      <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {prob.links.map((link, linkIdx) => {
                            const isLeetCode = link.platform === "leetcode";
                            const isGfG = link.platform === "geeksforgeeks";
                            const isYouTube = link.platform === "youtube";

                            return (
                              <a
                                key={linkIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all shadow-xs ${
                                  isLeetCode
                                    ? "bg-[#FFF8E7] text-[#B26A00] border border-[#FAD79A] hover:bg-[#FDE7BA]"
                                    : isGfG
                                    ? "bg-[#EBF7EE] text-[#1E7E34] border border-[#BDE7C5] hover:bg-[#D5EEDC]"
                                    : isYouTube
                                    ? "bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] hover:bg-[#FFCDD2]"
                                    : "bg-[#F7F4EE] text-[#1C1814] border border-[rgba(212,175,55,0.3)] hover:bg-[#FAF1DF]"
                                }`}
                                title={`Open ${link.label} in a new tab`}
                              >
                                {isLeetCode ? (
                                  <span className="font-bold text-[11px] text-[#FFA116]">LC</span>
                                ) : isGfG ? (
                                  <span className="font-bold text-[11px] text-[#2F8D46]">GFG</span>
                                ) : isYouTube ? (
                                  <span className="font-bold text-[11px] text-[#FF0000]">▶</span>
                                ) : (
                                  <Code2 className="h-3 w-3" />
                                )}
                                <span>{link.label}</span>
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              </a>
                            );
                          })}
                        </div>

                        {/* Quick Copy Link */}
                        {primaryLink && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(primaryLink, e)}
                            className="p-1.5 rounded-lg text-[#8C6208] hover:bg-[#FAF1DF] transition-colors"
                            title="Copy direct problem link"
                            aria-label="Copy problem link"
                          >
                            {copiedUrl === primaryLink ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[rgba(212,175,55,0.3)] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-[#FAF1DF] text-[#B8860B] flex items-center justify-center mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-regal text-lg font-bold text-[#1C1814]">
              No practice problems matched "{searchQuery}"
            </h4>
            <p className="text-xs text-[#6B5E51] max-w-md mx-auto">
              We couldn't find problems with that exact topic. Try exploring one of the core DSA patterns below:
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap max-w-xl mx-auto pt-2">
            {[
              "Two Pointers",
              "Sliding Window",
              "Binary Search",
              "Dynamic Programming",
              "Graphs",
              "Tree Pattern",
              "Heap Pattern",
              "Kadane Pattern",
            ].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  if (onSelectTopic) onSelectTopic(topic);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF1DF] text-[#8C6208] border border-[rgba(212,175,55,0.4)] hover:bg-[#B8860B] hover:text-white transition-all"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPatternId("all");
                setSelectedDifficulty("all");
                if (onSelectTopic) onSelectTopic("");
              }}
              className="text-xs border-[rgba(212,175,55,0.4)]"
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
