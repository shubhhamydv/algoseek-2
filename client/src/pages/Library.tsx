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
  Code,
  Database,
  Terminal,
  Smile,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface LibraryItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: "sheet" | "book" | "faang" | "pattern" | "resource" | "language";
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

export const LIBRARY_DATA: LibraryItem[] = [
  {
    id: "striver-patterns",
    title: "How to Recognize Which Data Structure to Use in a Question",
    subtitle: "Handwritten Mental Models & Pattern Recognition Strategy (Striver / takeUforward)",
    author: "Striver (takeUforward Algorithmic Cheatsheet)",
    category: "pattern",
    categoryLabel: "Pattern Recognition",
    pages: 4,
    questionsCount: "Core Pattern Diagnostic Rules",
    fileSize: "1.0 MB",
    fileName: "striver-dsa-pattern-recognition-cheatsheet.pdf",
    fileUrl: "/library/striver-dsa-pattern-recognition-cheatsheet.pdf",
    downloadName: "Striver-DSA-Pattern-Recognition-Guide.pdf",
    tags: ["Striver Cheatsheet", "Pattern Recognition", "Problem Diagnosis", "Handwritten", "Interview Strategy"],
    description:
      "A high-impact handwritten algorithmic cheatsheet detailing the exact thought process to determine which data structure to deploy: Two Pointers vs. Sliding Window, Hashing, Monotonic Stacks (NGE/NSE), Binary Search on answers, Backtracking decision trees, and 1D/2D DP.",
    keyTopics: [
      "Two Pointers vs Sliding Window (Sorted arrays, contiguous subarrays)",
      "Hashing (Frequency tracking, past value recall in traversal)",
      "Binary Search (Min/Max on Answer, Monotonic search spaces)",
      "Monotonic Stack & Queue (Trapping Rain Water, Next Greater Element)",
      "Recursion & Backtracking (Pick & Not Pick, N-Queens, Sudoku)",
      "Graphs (Multi-source BFS, Shortest Path, Disjoint Set Union)",
      "Dynamic Programming (1D & 2D States, String Matching, Trie)",
    ],
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    id: "ds-handwritten-master",
    title: "Data Structures Master Handwritten Notes & C Implementation Guide",
    subtitle: "Exhaustive 176-Page Course Compendium covering Memory, Lists, Trees & Graphs",
    author: "Naresh i Technologies & C-DS Hand Notes (Mr. Balu)",
    category: "book",
    categoryLabel: "Handbook & Notes",
    pages: 176,
    questionsCount: "176 Pages Complete Lecture Course",
    fileSize: "5.5 MB",
    fileName: "data-structures-handwritten-master-notes-176p.pdf",
    fileUrl: "/library/data-structures-handwritten-master-notes-176p.pdf",
    downloadName: "Data-Structures-Master-Handwritten-Notes-176Pages.pdf",
    tags: ["176 Pages", "Handwritten Master Notes", "C Implementations", "Pointers & Memory", "Trees & AVL", "Graphs & Sorting"],
    description:
      "A monumental 176-page handwritten lecture handbook detailing data structure internals with step-by-step memory pointer diagrams, full C code routines, and complexity analysis across every fundamental structure.",
    keyTopics: [
      "Dynamic Memory Management (malloc, calloc, realloc, free)",
      "Linked Lists (Single, Doubly, Circular, Split & Reverse)",
      "Stack Operations & Infix/Postfix/Prefix Notations",
      "Queues (Linear, Circular, Double-Ended Deque, Priority)",
      "Searching & Sorting (Bubble, Selection, Insertion, Merge, Quick, Shell, Radix)",
      "Binary Trees, BSTs & AVL Self-Balancing Rotations",
      "Graph Traversals (BFS, DFS, Spanning Trees, Hashing)",
    ],
    badgeColor: "from-[#B8860B] to-[#D4AF37]",
  },
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
      "A legendary 100-page problem book compiled by MNNIT Allahabad alumni. Features rigorous algorithmic approaches, in-place tricks, tree balancing, and 44 advanced miscellaneous interview problems.",
    keyTopics: [
      "Arrays & Median Finding in Logarithmic Time",
      "Linked Lists & In-Place Reversals",
      "Sorting & O(n) Counting Sort Variations",
      "Strings & Anagram Hashing",
      "Stacks, Queues & Priority Heaps",
      "Trees, BST Conversion & Traversal",
      "44 Miscellaneous Algorithmic Challenges",
    ],
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    id: "is-this-anything-seinfeld",
    title: "Is This Anything? — Jerry Seinfeld's Comedy Masterpieces",
    subtitle: "Decades of Laughter: Five Decades of Stand-Up Analysis, Philosophical Insights & Quizzes",
    author: "Written by Bookey (Based on Jerry Seinfeld's 45-Year Archive)",
    category: "book",
    categoryLabel: "Handbook & Literature",
    pages: 355,
    questionsCount: "42 Chapters + Quizzes & Page Quotes",
    fileSize: "3.1 MB",
    fileName: "is-this-anything-jerry-seinfeld-bookey.pdf",
    fileUrl: "/library/is-this-anything-jerry-seinfeld-bookey.pdf",
    downloadName: "Is-This-Anything-Jerry-Seinfeld-Bookey.pdf",
    tags: ["Jerry Seinfeld", "355 Pages", "Bookey Edition", "Critical Thinking", "Stand-Up Comedy", "Quizzes & Quotes"],
    description:
      "Epic 355-page analytical compendium exploring Jerry Seinfeld's legendary 45-year stand-up archive. Includes 42 chapter breakdowns (Cotton Balls, Dogs in Cars, Superman, Gym Class, Tone in Marriage, Pop-Tarts, Flex Seal), critical thinking perspectives on consumerism & social dynamics, verbatim quotes with original page citations, and comprehension tests.",
    keyTopics: [
      "42 Chapter Summaries & Comedy Analysis",
      "Observational Comedy & Social Psychology",
      "Critical Thinking: Gender, Consumerism & Modern Life",
      "Famous Quotes with Original Page Citations",
      "Reading Quizzes, Tests & Critical Reflection",
      "Decades of Stand-up Evolution (1975–2020)",
    ],
    badgeColor: "from-[#C59A3F] to-[#E2B855]",
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
    id: "java-cheatsheet",
    title: "Java Language & Syntax Cheatsheet",
    subtitle: "Quick-Reference Guide from Boilerplate to OOP, Streams, Methods & Math",
    author: "Standard Quick Reference Track",
    category: "language",
    categoryLabel: "Language Cheatsheet",
    pages: 8,
    questionsCount: "Core Java Syntax Reference",
    fileSize: "42 KB",
    fileName: "java-programming-cheatsheet.pdf",
    fileUrl: "/library/java-programming-cheatsheet.pdf",
    downloadName: "Java-Language-Syntax-Cheatsheet.pdf",
    tags: ["Java", "Syntax Cheatsheet", "OOP & Primitives", "Scanner I/O", "Methods & Strings"],
    description:
      "Concise 8-page quick reference covering Java boilerplate, Scanner I/O, 8 primitive data types, operators, escape sequences, widening/narrowing typecasting, control flow (if/else, ternary, switch), loops (while, do-while, for, for-each), arrays, methods, method overloading, recursion, String methods, and Math class utilities.",
    keyTopics: [
      "Boilerplate & Scanner I/O",
      "8 Primitive Types & Ranges",
      "Type Casting (Widening & Narrowing)",
      "Control Flow, Ternary & Switch",
      "Loops (for-each, do-while, break/continue)",
      "Arrays & 2D Matrix",
      "Methods, Overloading & Recursion",
      "String & Math Class Utilities",
    ],
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    id: "javascript-cheatsheet",
    title: "JavaScript & Modern ES6+ Cheatsheet",
    subtitle: "DOM Manipulation, Arrays, Async/Await, Events & Modern ES6+ Syntax",
    author: "Web Engineering Reference Track",
    category: "language",
    categoryLabel: "Language Cheatsheet",
    pages: 8,
    questionsCount: "Modern ES6+ Syntax Guide",
    fileSize: "40 KB",
    fileName: "javascript-core-cheatsheet.pdf",
    fileUrl: "/library/javascript-core-cheatsheet.pdf",
    downloadName: "JavaScript-Modern-ES6-Cheatsheet.pdf",
    tags: ["JavaScript", "ES6+", "DOM Manipulation", "Async Await", "Array Methods"],
    description:
      "Comprehensive 8-page reference guide covering modern variable scoping (let, const), DOM selection & element appending, higher-order array methods (map, filter, reduce), Math & Dates, Event Listeners, Error handling (try/catch/finally), Promises & Async/Await, and modern ES6+ features (destructuring, spread/rest, modules).",
    keyTopics: [
      "Script Loading (defer, type=module)",
      "Variable Scoping (let, const)",
      "DOM Selection & Manipulation",
      "Array Methods (map, filter, reduce)",
      "Event Listeners & Delegation",
      "Async JavaScript (Promises, async/await)",
      "ES6+ Destructuring & Spread/Rest",
      "Modules & DevTools Debugging",
    ],
    badgeColor: "from-[#C59A3F] to-[#F3D279]",
  },
  {
    id: "mongodb-cheatsheet",
    title: "MongoDB Database & Aggregation Cheatsheet",
    subtitle: "Essential CRUD, Operators, Indexes & Aggregation Pipeline Reference",
    author: "Full-Stack Database Track",
    category: "language",
    categoryLabel: "Database Cheatsheet",
    pages: 7,
    questionsCount: "Complete Mongo Command Set",
    fileSize: "33 KB",
    fileName: "mongodb-database-cheatsheet.pdf",
    fileUrl: "/library/mongodb-database-cheatsheet.pdf",
    downloadName: "MongoDB-Commands-Cheatsheet.pdf",
    tags: ["MongoDB", "NoSQL Database", "CRUD Commands", "Aggregation Pipeline", "Indexes"],
    description:
      "Complete 7-page command reference for MongoDB (compatible with v4.2 to v7.x) covering database/collection administration, CRUD operations (insertOne, find, updateOne, deleteMany), query operators ($gt, $lte, $in, $and, $or), sorting, pagination (skip, limit), index management, and aggregation pipelines ($group, $sum, $avg).",
    keyTopics: [
      "Database & Collection Lifecycle",
      "Document CRUD (insertOne, insertMany, find)",
      "Update Commands ($set, $inc, $rename, upsert)",
      "Query Comparison & Logical Operators",
      "Sorting & Pagination (skip, limit)",
      "Index Optimization (createIndex, dropIndex)",
      "Aggregation Pipelines ($group, $sum, $avg)",
    ],
    badgeColor: "from-[#B8860B] to-[#D4AF37]",
  },
  {
    id: "applications-ds-real-life",
    title: "Applications of Data Structures in Real Life",
    subtitle: "Visual Architectural Breakdown of Where Every Data Structure Powers Modern Tech",
    author: "Aakash Kanojiya (@Aakash Kanojiya)",
    category: "resource",
    categoryLabel: "Real-World Concepts",
    pages: 9,
    questionsCount: "7 Core Structures Analyzed",
    fileSize: "451 KB",
    fileName: "applications-of-data-structures-in-real-life.pdf",
    fileUrl: "/library/applications-of-data-structures-in-real-life.pdf",
    downloadName: "Real-Life-Applications-of-Data-Structures.pdf",
    tags: ["Real World Systems", "System Architecture", "Visual Guide", "Interview Discussion", "OS & Networking"],
    description:
      "A visually engaging, highly practical guide mapping theoretical data structures to production systems: 2D arrays in image processing, doubly-linked lists in music playlists & feeds, stacks in undo/redo & browser history, queues in OS scheduling, graphs in social friend suggestions & React Virtual DOM, and trees in file systems & B-Tree databases.",
    keyTopics: [
      "2D Arrays: Image Processing, Sudoku & Chessboards",
      "Linked Lists: Music Players, Train Coaches, Social Feeds",
      "Stacks: Undo/Redo Word Processors, Browser History Navigation",
      "Queues: Printer Spoolers, Server Request Handling, OS Scheduling",
      "Graphs: Social Networks, React Virtual DOM, DAG in MS Excel",
      "Trees: B-Trees in Databases, DNS Resolution, HTML DOM, File Systems",
      "Sorting: IntroSort in STL sort(), Backend Merge Sort",
    ],
    badgeColor: "from-[#D4AF37] to-[#E2B855]",
  },
  {
    id: "beginners-coding-sheet",
    title: "Beginners Coding Sheet — 65 Core Fundamentals",
    subtitle: "One-Stop Solution for Newbies covering Logic, Loops, Patterns & Recursion",
    author: "Siddharth Singh (YT: Siddharth Singh)",
    category: "sheet",
    categoryLabel: "Problem Sheet",
    pages: 12,
    questionsCount: "65 Essential Problems",
    fileSize: "1.6 MB",
    fileName: "beginners-coding-sheet-siddharth-singh.pdf",
    fileUrl: "/library/beginners-coding-sheet-siddharth-singh.pdf",
    downloadName: "Beginners-Coding-Sheet-65-Problems-Siddharth-Singh.pdf",
    tags: ["Beginner Friendly", "65 Problems", "Pattern Printing", "Loops & Math", "Functions & Recursion"],
    description:
      "Carefully structured 65-question curriculum designed to take beginners from basic I/O and branching logic to pattern printing, recursion, 2D matrix multiplication, and string manipulation.",
    keyTopics: [
      "Basic Logic & Integer Computations (Divisor, Dividend, ASCII)",
      "Conditional If-Else & Quadratic Equation Solvers",
      "Loops, Prime Intervals, Armstrong & Factorial",
      "Pattern Printing (Pyramid Stars, Numbers, Pascal Triangle)",
      "Functions & Expressing Integers as Sum of Primes",
      "Recursion (Sum of N, Factorial, GCD, Power)",
      "1D & Multi-Dimensional Matrix Transpose & Multiplication",
      "Strings (Frequency, Character Replacement, Palindromes)",
    ],
    badgeColor: "from-[#C59A3F] to-[#E2B855]",
  },
  {
    id: "youtube-programming-resources",
    title: "All Important Links to Learn Programming on YouTube",
    subtitle: "Curated Topic-Wise Roadmaps for DSA, Web Dev & Standout Portfolio Projects",
    author: "Himanshu Shekhar (himanshu_shekhar16)",
    category: "resource",
    categoryLabel: "Curated Roadmaps",
    pages: 3,
    questionsCount: "Curated Links & Projects",
    fileSize: "207 KB",
    fileName: "youtube-programming-resources-dsa-dev.pdf",
    fileUrl: "/library/youtube-programming-resources-dsa-dev.pdf",
    downloadName: "YouTube-Programming-Resources-DSA-WebDev.pdf",
    tags: ["YouTube Directory", "Curated Playlists", "Full-Stack Projects", "DSA Channels", "Project Ideas"],
    description:
      "A comprehensive directory collecting direct links to the highest quality YouTube playlists for every DSA topic, premier development channels, and standout CV project blueprints (Amazon Clone, Netflix Clone, TinyURL, Sudoku Solver, Huffman Zipper).",
    keyTopics: [
      "Topic-Wise DSA Playlists (DP, Sliding Window, Trees, Graphs)",
      "Top YouTube DSA Channels (Striver, Abdul Bari, Aditya Verma)",
      "Web Development Roadmap (HTML, CSS, JS, React, Node, Mongo)",
      "Full-Stack Project Blueprints (Amazon Clone, Netflix, Real-time Chat)",
      "Resume DSA Projects (TinyURL Hash, Huffman Encoder, Map Navigator)",
      "Android Project Inspirations (Face Filter, Crypto Tracker)",
    ],
    badgeColor: "from-[#B8860B] to-[#F3D279]",
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: LIBRARY_DATA.length,
      sheet: 0,
      faang: 0,
      book: 0,
      pattern: 0,
      resource: 0,
      language: 0,
    };
    LIBRARY_DATA.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

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
        <div className="absolute top-[-10%] right-[-5%] w-[850px] h-[600px] bg-gradient-to-br from-[#E2B855]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[30%] left-[-10%] w-[650px] h-[650px] bg-gradient-to-tr from-[#C59A3F]/12 via-[#FAF7F2]/5 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] right-[20%] w-[750px] h-[550px] bg-gradient-to-t from-[#E2B855]/15 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ─── Top Header Bar ─── */}
      <header className="relative z-10 border-b border-[rgba(212,175,55,0.3)] bg-white/75 backdrop-blur-md sticky top-0 px-6 py-3.5 transition-all">
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
            <span className="text-xs font-medium text-[#756858] hidden md:inline-flex items-center gap-1.5 font-mono">
              <FileCheck className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>{LIBRARY_DATA.length} Verified Study Assets</span>
            </span>

            {/* Full Stack Engineer Hub CTA Button */}
            <Link
              href="/library/learning-hub"
              className="text-xs font-bold text-[#1C1814] bg-[#FAF3E8] hover:bg-[#F5E4B7] px-3.5 py-1.5 rounded-xl shadow-xs border border-[rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Full Stack Engineer Learning Hub"
            >
              <GraduationCap className="h-3.5 w-3.5 text-[#B8860B]" />
              <span>Learning Hub</span>
            </Link>

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
            Essential reference sheets, pattern recognition guides, real-world systems,
            programming cheatsheets, Google-tagged problem sets, and master algorithmic handbooks.
            Preview directly or download for offline study.
          </p>
        </div>

        {/* ─── Featured Spotlight: Full Stack Engineer Hub ─── */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/95 via-[#FAF3E8]/90 to-white/95 border-2 border-[rgba(212,175,55,0.4)] shadow-[0_12px_36px_rgba(184,134,11,0.08)] p-6 sm:p-7 backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855]" />
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF3E8] to-[#F5E4B7] border border-[rgba(212,175,55,0.4)] flex items-center justify-center text-[#B8860B] shrink-0 shadow-xs">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FAF3E8] text-[#8C6208] border border-[rgba(212,175,55,0.4)] font-mono">
                      Curated Video Tracks
                    </span>
                    <span className="text-xs text-[#756858] font-mono">
                      7 Core Engineering Disciplines
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1C1814] tracking-tight">
                    Full Stack Engineer Hub
                  </h2>
                  <p className="text-xs sm:text-sm text-[#756858] mt-1 max-w-2xl leading-relaxed">
                    Master modern engineering with top-rated YouTube courses and playlists across <strong>Frontend, Backend, Databases, Languages, Data Analyst, AI/ML,</strong> and <strong>DSA</strong>.
                  </p>
                </div>
              </div>

              <Link
                href="/library/learning-hub"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] hover:opacity-95 text-[#1C1814] shadow-md border border-[rgba(212,175,55,0.4)] transition-all shrink-0 cursor-pointer"
              >
                <span>Open Learning Hub</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/80 p-3 rounded-2xl border border-[rgba(212,175,55,0.3)] shadow-xs backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 scrollbar-none">
            {[
              { id: "all", label: "All Assets" },
              { id: "pattern", label: "Pattern Strategy" },
              { id: "sheet", label: "Problem Sheets" },
              { id: "book", label: "Handbooks & Books" },
              { id: "language", label: "Language & DB" },
              { id: "faang", label: "Google / FAANG" },
              { id: "resource", label: "Real-World & Roadmaps" },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              const count = categoryCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
                    {count}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="group relative flex flex-col justify-between rounded-3xl bg-white/95 border border-[rgba(212,175,55,0.32)] hover:border-[#B8860B] shadow-[0_10px_30px_rgba(28,24,20,0.04)] hover:shadow-[0_16px_40px_rgba(184,134,11,0.12)] transition-all duration-300 overflow-hidden p-6"
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
                  <h2 className="text-lg font-bold font-serif text-[#1C1814] group-hover:text-[#B8860B] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-xs font-medium text-[#8C6208] mt-1 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.author}</span>
                  </p>

                  <p className="text-xs text-[#756858] leading-relaxed mt-2.5 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Key Topics Tag Pill List */}
                  <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.2)]">
                    <span className="text-[10px] font-bold text-[#8C7E72] uppercase tracking-wider block mb-2 font-regal">
                      Focus Areas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keyTopics.slice(0, 3).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FAF7F2] text-[#2C251E] border border-[rgba(212,175,55,0.25)] truncate max-w-full"
                          title={topic}
                        >
                          {topic}
                        </span>
                      ))}
                      {item.keyTopics.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAF3E8] text-[#8C6208] border border-[rgba(212,175,55,0.3)] font-mono">
                          +{item.keyTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Companies (if applicable) */}
                  {item.companies && item.companies.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#756858]">
                      <Building2 className="h-3.5 w-3.5 text-[#B8860B] shrink-0" />
                      <span className="font-semibold text-[#1C1814]">Companies:</span>
                      <span className="truncate">{item.companies.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.25)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Direct Download Button */}
                    <a
                      href={item.fileUrl}
                      download={item.downloadName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] hover:from-[#a07409] hover:to-[#cfa341] text-[#1C1814] shadow-xs hover:shadow-md transition-all border border-[rgba(212,175,55,0.4)]"
                      title={`Download ${item.fileName} directly`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>

                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewPdf(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F5EFEB] text-[#1C1814] border border-[rgba(212,175,55,0.35)] transition-all"
                      title="Quick preview in modal"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#B8860B]" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  {/* Share & Open external tab */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(item)}
                      className="p-1.5 rounded-lg text-[#756858] hover:text-[#1C1814] hover:bg-[#FAF7F2] transition-colors"
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
                      className="p-1.5 rounded-lg text-[#756858] hover:text-[#B8860B] hover:bg-[#FAF7F2] transition-colors"
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
