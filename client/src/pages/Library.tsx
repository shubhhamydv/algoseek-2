import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Download,
  FileText,
  ExternalLink,
  Eye,
  ArrowLeft,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  Building2,
  GraduationCap,
  FileCheck,
  X,
  Share2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LibraryItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: "sheet" | "book" | "faang";
  categoryLabel: string;
  pages: number;
  questionsCount?: string;
  fileSize: string;
  fileName: string;
  fileUrl: string;
  downloadName: string;
  tags: string[];
  description: string;
  keyTopics: string[];
  companies?: string[];
  badgeColor: string;
}

const LIBRARY_DATA: LibraryItem[] = [
  {
    id: "raghav-sir-notes",
    title: "The Problem Book of Life & Death — Data Structures",
    subtitle: "Complete Algorithmic Problem Solving & Proofs with C Code",
    author: "By Raghav Sir (Compiled by Uphar Goyal · MNNIT Allahabad)",
    category: "book",
    categoryLabel: "Handbook & Notes",
    pages: 100,
    questionsCount: "100+ Deep Dive Problems",
    fileSize: "560 KB",
    fileName: "raghav-sir-data-structures-notes.pdf",
    fileUrl: "/library/raghav-sir-data-structures-notes.pdf",
    downloadName: "Data-Structures-Problem-Book-Raghav-Sir-MNNIT.pdf",
    tags: ["MNNIT Allahabad", "100 Pages", "C Implementations", "Proof of Correctness", "All Core Data Structures"],
    description:
      "A legendary, highly detailed 100-page handwritten and typeset problem book compiled by MNNIT Allahabad alumni. Features rigorous algorithmic approaches, in-place tricks, tree balancing, and 44 advanced miscellaneous interview problems.",
    keyTopics: [
      "Arrays & Median Finding",
      "Linked Lists & In-Place Reversal",
      "Sorting & O(n) Counting Sort",
      "Strings & Anagram Hashing",
      "Stacks, Queues & Priority Heaps",
      "Trees, BST Conversion & Traversal",
      "44 Miscellaneous Algorithmic Challenges",
    ],
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    id: "google-sde-sheet",
    title: "Google SDE Sheet — 457 Tagged LeetCode Questions",
    subtitle: "Real Interview Questions Asked in Past 6 Months Sorted by Difficulty",
    author: "Saheb Kumar (@sahebCSE)",
    category: "faang",
    categoryLabel: "Google / FAANG",
    pages: 36,
    questionsCount: "457 LeetCode Problems",
    fileSize: "433 KB",
    fileName: "google-sde-sheet-457.pdf",
    fileUrl: "/library/google-sde-sheet-457.pdf",
    downloadName: "Google-SDE-Sheet-457-Problems-Saheb-Kumar.pdf",
    tags: ["Google Interview", "LeetCode Tagged", "Sorted by Acceptance", "457 Questions", "36 Pages"],
    description:
      "Comprehensive compilation of 457 Google-tagged interview questions asked over the last 6 months. Meticulously organized in ascending order of acceptance rate, spanning Easy, Medium, and Hard challenges with exact problem IDs.",
    keyTopics: [
      "Dynamic Programming & Subarrays",
      "Graph Algorithms (Shortest Path, DAG, BFS/DFS)",
      "Trees & BST Iterators",
      "Tries & Advanced Matrix Traversal",
      "Intervals, Two Pointers & Sliding Window",
      "System Simulation & Math",
    ],
    companies: ["Google", "Alphabet", "DeepMind"],
    badgeColor: "from-[#C59A3F] to-[#F3D279]",
  },
  {
    id: "apna-college-dsa-375",
    title: "Apna College DSA Master Sheet — 375 Questions",
    subtitle: "Complete Curriculum with Company Tags & Ideal Solving Time Budgets",
    author: "Shradha Didi & Aman Bhaiya (Apna College)",
    category: "sheet",
    categoryLabel: "Problem Sheet",
    pages: 5,
    questionsCount: "375 Targeted Questions",
    fileSize: "123 KB",
    fileName: "apna-college-dsa-375-sheet.pdf",
    fileUrl: "/library/apna-college-dsa-375-sheet.pdf",
    downloadName: "Apna-College-DSA-375-Questions-Sheet.pdf",
    tags: ["Apna College", "375 Questions", "Company Tagged", "Time Budgets", "Complete 16 Topics"],
    description:
      "Structured 375-question master roadmap covering 16 topics with specific company tags (Google, Microsoft, Amazon, Adobe, Flipkart, Samsung) and recommended time targets (5-10m for Easy, 15-20m for Medium, 40-60m for Hard).",
    keyTopics: [
      "Arrays & 2D Matrices (Kadane, Rotate, Spiral)",
      "Strings (KMP, Rabin-Karp, Palindromes)",
      "Searching & Sorting (Inversion Count, Merge Sort)",
      "Backtracking & N-Queens",
      "Linked Lists & LRU Cache",
      "Binary Trees & BSTs",
      "Heaps, Hashing & Segment Trees",
      "Dynamic Programming & Bit Manipulation",
    ],
    companies: ["Microsoft", "Amazon", "Google", "Adobe", "Flipkart", "Samsung"],
    badgeColor: "from-[#B8860B] to-[#D4AF37]",
  },
  {
    id: "dsa-170-sheet",
    title: "170 Questions Core DSA Problem Sheet",
    subtitle: "Topic-Wise High Frequency Sheet with Direct LeetCode & GFG Links",
    author: "Curated Competitive Programming Track",
    category: "sheet",
    categoryLabel: "Problem Sheet",
    pages: 4,
    questionsCount: "170 Essential Problems",
    fileSize: "62 KB",
    fileName: "dsa-170-problem-sheet.pdf",
    fileUrl: "/library/dsa-170-problem-sheet.pdf",
    downloadName: "DSA-170-Questions-Core-Sheet.pdf",
    tags: ["170 Questions", "Topic-Wise", "LeetCode Links", "GeeksforGeeks", "Concise 4-Page Sheet"],
    description:
      "A laser-focused 170-problem cheat sheet organizing foundational to advanced interview challenges by sub-topic with direct LeetCode and GeeksforGeeks practice links.",
    keyTopics: [
      "Array (Two Pointers, Hashmap, Kadane)",
      "Binary Search & Median of Arrays",
      "String (Sliding Window, Anagrams)",
      "Greedy & Jump Game",
      "Recursion, Backtracking & Sudoku Solver",
      "Dynamic Programming (LCS, Coin Change, Knapsack)",
      "Trees, BSTs, Graphs & Heaps",
    ],
    badgeColor: "from-[#D4AF37] to-[#E2B855]",
  },
];

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewPdf, setPreviewPdf] = useState<LibraryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return LIBRARY_DATA.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.keyTopics.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleShare = (item: LibraryItem) => {
    const fullUrl = window.location.origin + item.fileUrl;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1814] flex flex-col font-sans selection:bg-[#F3D279] selection:text-[#1C1814]">
      {/* ─── Atmospheric Golden Glow Background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[550px] bg-gradient-to-br from-[#E2B855]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#C59A3F]/12 via-[#FAF7F2]/5 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] right-[20%] w-[700px] h-[500px] bg-gradient-to-t from-[#E2B855]/15 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ─── Top Header Bar ─── */}
      <header className="relative z-10 border-b border-[rgba(212,175,55,0.3)] bg-white/70 backdrop-blur-md sticky top-0 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#756858] hover:text-[#B8860B] transition-colors px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[#FAF7F2] hover:bg-[#F5EFEB]"
              title="Return to Main Search & Tutor"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[rgba(212,175,55,0.25)]">
              <span className="font-regal text-sm font-bold tracking-tight text-[#1C1814]">
                ALGOSEEK
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F5E4B7] text-[#8C6208] border border-[rgba(212,175,55,0.4)]">
                Library Vault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#756858] hidden md:inline-flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>4 Curated Study Materials</span>
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
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] border border-[rgba(212,175,55,0.4)] shadow-xs">
            <BookOpen className="h-3.5 w-3.5 text-[#B8860B]" />
            <span className="text-xs font-bold tracking-widest uppercase font-regal text-[#8C6208]">
              STUDY ASSETS & HANDBOOKS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1814] font-regal tracking-tight leading-tight">
            Curated DSA & Interview Library
          </h1>

          <p className="text-base sm:text-lg text-[#756858] font-editorial leading-relaxed max-w-2xl mx-auto">
            Essential reference sheets, Google-tagged LeetCode compilations, and
            MNNIT algorithmic notes. Preview directly or download for your offline
            interview preparation.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/80 p-3 rounded-2xl border border-[rgba(212,175,55,0.3)] shadow-xs backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
            {[
              { id: "all", label: "All Assets", count: LIBRARY_DATA.length },
              { id: "sheet", label: "Problem Sheets", count: 2 },
              { id: "faang", label: "Google / FAANG", count: 1 },
              { id: "book", label: "Handbooks & Notes", count: 1 },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? "bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] text-[#1C1814] shadow-xs border border-[rgba(212,175,55,0.4)]"
                      : "text-[#756858] hover:text-[#1C1814] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active
                        ? "bg-[#1C1814]/15 text-[#1C1814]"
                        : "bg-[#F4ECE1] text-[#756858]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#756858]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sheets, topics, authors..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[#FAF7F2] border border-[rgba(212,175,55,0.3)] focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none text-[#1C1814] placeholder-[#756858]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#756858] hover:text-[#1C1814]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Cards Grid ─── */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-[rgba(212,175,55,0.4)] p-8">
            <BookOpen className="h-10 w-10 text-[#C59A3F] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-[#1C1814] font-regal">
              No matching documents found
            </h3>
            <p className="text-xs text-[#756858] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or selecting another category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 border-[#C59A3F]/50 text-[#1C1814] rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="group relative flex flex-col justify-between rounded-3xl bg-white/90 border border-[rgba(212,175,55,0.32)] hover:border-[#B8860B] shadow-[0_10px_30px_rgba(28,24,20,0.04)] hover:shadow-[0_16px_40px_rgba(184,134,11,0.12)] transition-all duration-300 overflow-hidden p-6"
              >
                {/* Subtle top gold gradient strip on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C59A3F] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Card Header Meta */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-[#FAF3E8] text-[#8C6208] border border-[rgba(212,175,55,0.35)]">
                      <FileText className="h-3 w-3 text-[#B8860B]" />
                      <span>{item.categoryLabel}</span>
                    </span>

                    <div className="flex items-center gap-2 text-xs text-[#756858]">
                      <span className="font-mono">{item.pages} Pages</span>
                      <span>•</span>
                      <span className="font-mono">{item.fileSize}</span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h2 className="text-xl font-bold font-serif text-[#1C1814] group-hover:text-[#B8860B] transition-colors leading-snug">
                    {item.title}
                  </h2>

                  <p className="text-xs font-medium text-[#8C6208] mt-1 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.author}</span>
                  </p>

                  <p className="text-xs text-[#756858] leading-relaxed mt-3">
                    {item.description}
                  </p>

                  {/* Key Topics Tag Pill List */}
                  <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.2)]">
                    <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block mb-2 font-regal">
                      Core Content & Focus
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keyTopics.slice(0, 4).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-[#2C251E] border border-[rgba(212,175,55,0.25)]"
                        >
                          {topic}
                        </span>
                      ))}
                      {item.keyTopics.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAF3E8] text-[#8C6208] border border-[rgba(212,175,55,0.3)] font-mono">
                          +{item.keyTopics.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Companies (if applicable) */}
                  {item.companies && item.companies.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#756858]">
                      <Building2 className="h-3.5 w-3.5 text-[#B8860B] shrink-0" />
                      <span className="font-semibold text-[#1C1814]">Target Companies:</span>
                      <span className="truncate">{item.companies.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.25)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Direct Download Button */}
                    <a
                      href={item.fileUrl}
                      download={item.downloadName}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] hover:from-[#a07409] hover:to-[#cfa341] text-[#1C1814] shadow-sm hover:shadow-md transition-all border border-[rgba(212,175,55,0.4)]"
                      title={`Download ${item.fileName} directly`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>

                    {/* Preview / View in Browser Button */}
                    <button
                      onClick={() => setPreviewPdf(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F5EFEB] text-[#1C1814] border border-[rgba(212,175,55,0.35)] transition-all"
                      title="Quick preview in modal"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#B8860B]" />
                      <span>Preview</span>
                    </button>
                  </div>

                  {/* Open in new tab direct link & share */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 rounded-lg text-[#756858] hover:text-[#1C1814] hover:bg-[#FAF7F2] transition-colors"
                      title="Copy link to clipboard"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-[#756858] hover:text-[#B8860B] hover:bg-[#FAF7F2] transition-colors"
                      title="Open raw PDF in new browser tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-12 text-center p-6 rounded-3xl bg-white/60 border border-[rgba(212,175,55,0.25)] max-w-xl mx-auto">
          <Sparkles className="h-5 w-5 text-[#B8860B] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#1C1814] font-regal">
            Need AI Answers Grounded in These Documents?
          </h4>
          <p className="text-xs text-[#756858] mt-1 leading-relaxed">
            You can query concepts from these sheets in real-time or upload additional
            custom course materials directly through the Ask Your Study Material home desk.
          </p>
          <div className="mt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B8860B] hover:text-[#8C6208] transition-colors"
            >
              <span>Go to AI Problem Solver</span>
              <ArrowLeft className="h-3 w-3 rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      {/* ─── PDF Preview Modal ─── */}
      <AnimatePresence>
        {previewPdf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl h-[88vh] bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[rgba(212,175,55,0.4)] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-3.5 bg-white border-b border-[rgba(212,175,55,0.3)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF3E8] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#B8860B] shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold font-serif text-[#1C1814] truncate">
                      {previewPdf.title}
                    </h3>
                    <p className="text-[11px] text-[#756858] truncate">
                      {previewPdf.pages} Pages • {previewPdf.fileSize} • {previewPdf.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewPdf.fileUrl}
                    download={previewPdf.downloadName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] to-[#E2B855] text-[#1C1814] shadow-xs"
                    title="Download this document"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>

                  <a
                    href={previewPdf.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#756858] hover:text-[#1C1814] hover:bg-[#FAF7F2]"
                    title="Open in external browser window"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => setPreviewPdf(null)}
                    className="p-2 rounded-xl text-[#756858] hover:text-[#1C1814] hover:bg-[#FAF7F2]"
                    aria-label="Close Preview"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="flex-1 bg-[#2C251E]/5 relative">
                <iframe
                  src={`${previewPdf.fileUrl}#toolbar=1&navpanes=0`}
                  title={previewPdf.title}
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
