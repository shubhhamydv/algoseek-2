/**
 * Learning Hub Curated Resource Directory
 * Single source of truth for all Full Stack Engineer Hub video and playlist resources.
 *
 * HOW TO ADD A NEW LINK:
 * Simply add a new object to the desired category array below:
 *   {
 *     title: "Course or Video Title",
 *     url: "https://www.youtube.com/watch?v=...", // or https://youtu.be/... or playlist link
 *     type: "video" | "playlist",
 *     channel: "Channel Name (optional)",
 *     duration: "Optional duration or lecture count",
 *   }
 */

export type ResourceType = "video" | "playlist";

export interface LearningResource {
  title: string;
  url: string;
  type: ResourceType;
  channel?: string;
  duration?: string;
}

export type CategoryKey =
  | "frontend"
  | "backend"
  | "databases"
  | "languages"
  | "dataAnalyst"
  | "aiml"
  | "dsa";

export interface CategoryMetadata {
  key: CategoryKey;
  title: string;
  subtitle: string;
  description: string;
  iconName: "Layout" | "Server" | "Database" | "Code" | "BarChart3" | "Brain" | "GitBranch";
  badgeColor: string;
}

export const LEARNING_CATEGORIES: CategoryMetadata[] = [
  {
    key: "frontend",
    title: "Frontend",
    subtitle: "Modern Web UI & Client Engineering",
    description:
      "HTML5, CSS3, modern JavaScript (ES6+), React 19, Next.js, responsive design systems, state management, and high-performance browser rendering.",
    iconName: "Layout",
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    key: "backend",
    title: "Backend",
    subtitle: "Distributed Systems & Server Architecture",
    description:
      "Node.js, Express, Go, Python APIs, microservices, RESTful & GraphQL interfaces, authentication (JWT/OAuth), caching, and system scalability.",
    iconName: "Server",
    badgeColor: "from-[#C59A3F] to-[#E2B855]",
  },
  {
    key: "databases",
    title: "Databases",
    subtitle: "Data Persistence & Query Optimization",
    description:
      "PostgreSQL, MySQL, MongoDB, Redis in-memory caching, indexing strategies, ACID guarantees, query plan analysis, and data modeling.",
    iconName: "Database",
    badgeColor: "from-[#B8860B] to-[#D4AF37]",
  },
  {
    key: "languages",
    title: "Languages",
    subtitle: "Core Syntax & Memory Models",
    description:
      "Deep dive into TypeScript type systems, Python programming, C++ pointer mechanics & STL, Java object-oriented architecture, and modern Go.",
    iconName: "Code",
    badgeColor: "from-[#D4AF37] to-[#F5E4B7]",
  },
  {
    key: "dataAnalyst",
    title: "Data Analyst",
    subtitle: "Analytics, SQL & Business Intelligence",
    description:
      "SQL query engineering, Python for data manipulation with Pandas & NumPy, dashboard storytelling with Power BI & Tableau, and exploratory data analysis.",
    iconName: "BarChart3",
    badgeColor: "from-[#8C6208] to-[#C59A3F]",
  },
  {
    key: "aiml",
    title: "AI / ML",
    subtitle: "Machine Learning & Neural Architecture",
    description:
      "Supervised & unsupervised learning, deep neural networks, PyTorch, Large Language Models (LLMs), RAG pipelines, and vector embeddings.",
    iconName: "Brain",
    badgeColor: "from-[#B8860B] to-[#E2B855]",
  },
  {
    key: "dsa",
    title: "DSA",
    subtitle: "Data Structures & Algorithmic Patterns",
    description:
      "Foundational to advanced structures, Two Pointers, Sliding Window, Monotonic Stacks, Binary Search on answer, Dynamic Programming, and Graph algorithms.",
    iconName: "GitBranch",
    badgeColor: "from-[#C59A3F] to-[#B8860B]",
  },
];

export const LEARNING_RESOURCES: Record<CategoryKey, LearningResource[]> = {
  frontend: [
    {
      title: "Namaste JavaScript — Master Closures, Prototypes & Event Loops",
      url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP",
      type: "playlist",
      channel: "Akshay Saini",
      duration: "18 Complete Lectures",
    },
    {
      title: "React 19 & Next.js App Router Masterclass — Full Stack Web Development",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      type: "video",
      channel: "freeCodeCamp",
      duration: "10 Hours Full Course",
    },
    {
      title: "CSS & Modern Flexbox/Grid Responsive Layout Systems",
      url: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
      type: "video",
      channel: "SuperSimpleDev",
      duration: "6.5 Hours Masterclass",
    },
  ],

  backend: [
    {
      title: "Node.js and Express.js Full Course — Build Production REST APIs",
      url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      type: "video",
      channel: "freeCodeCamp",
      duration: "8 Hours Comprehensive",
    },
    {
      title: "System Design for Beginners — Distributed Caching, Sharding & Load Balancing",
      url: "https://www.youtube.com/playlist?list=PLMC9HnG_SVgwP4Vp5-U9e9nJ4v5p_9b4o",
      type: "playlist",
      channel: "Gaurav Sen",
      duration: "System Design Series",
    },
    {
      title: "Go (Golang) Backend Programming Master Course from Scratch",
      url: "https://www.youtube.com/watch?v=un6ZyFkqFJU",
      type: "video",
      channel: "TechWorld with Nana",
      duration: "3.5 Hours Complete Guide",
    },
  ],

  databases: [
    {
      title: "PostgreSQL Database Tutorial — Full Course for Beginners to Advanced",
      url: "https://www.youtube.com/watch?v=qw--VYLpxG4",
      type: "video",
      channel: "freeCodeCamp",
      duration: "4.5 Hours Practical SQL",
    },
    {
      title: "MongoDB & Aggregation Pipeline Tutorial — Deep Dive into NoSQL",
      url: "https://www.youtube.com/watch?v=ofme2o29ngU",
      type: "video",
      channel: "Web Dev Simplified",
      duration: "Complete NoSQL Tutorial",
    },
    {
      title: "Database Indexing, B-Trees & Query Optimization Essentials",
      url: "https://www.youtube.com/watch?v=HubezKbFL7E",
      type: "video",
      channel: "Hussein Nasser",
      duration: "Internals & Performance",
    },
  ],

  languages: [
    {
      title: "TypeScript Full Course for Beginners — Master Generics, Interfaces & Types",
      url: "https://www.youtube.com/watch?v=d56mG7DezGs",
      type: "video",
      channel: "Dave Gray",
      duration: "4 Hours Complete Course",
    },
    {
      title: "Python for Beginners — Full Course with Real-World Projects",
      url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      type: "video",
      channel: "Programming with Mosh",
      duration: "6 Hours Complete",
    },
    {
      title: "C++ Programming Course — Memory Architecture, Pointers & OOP",
      url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
      type: "video",
      channel: "freeCodeCamp",
      duration: "31 Hours Masterclass",
    },
  ],

  dataAnalyst: [
    {
      title: "SQL for Data Analytics Bootcamp — Window Functions, CTEs & Aggregations",
      url: "https://www.youtube.com/watch?v=qfyynHBFOsM",
      type: "video",
      channel: "Alex The Analyst",
      duration: "Comprehensive Data Bootcamp",
    },
    {
      title: "Python for Data Analysis — Pandas, NumPy & Data Visualization",
      url: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
      type: "video",
      channel: "Keith Galli",
      duration: "Pandas & Data Science",
    },
    {
      title: "Power BI Full Course — End-to-End Business Intelligence & Dashboards",
      url: "https://www.youtube.com/playlist?list=PLWPirh4EWFpEpO6NjjWLbKSCb-wx3hMql",
      type: "playlist",
      channel: "Edureka",
      duration: "Complete Playlist",
    },
  ],

  aiml: [
    {
      title: "Machine Learning with Python — Mathematical Foundations & Practical Models",
      url: "https://www.youtube.com/watch?v=7eh4d6sabA0",
      type: "video",
      channel: "freeCodeCamp",
      duration: "10 Hours Deep Dive",
    },
    {
      title: "Deep Learning & Neural Networks Foundations with PyTorch",
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      type: "video",
      channel: "3Blue1Brown",
      duration: "Visual Masterclass",
    },
    {
      title: "Large Language Models & Generative AI Architecture Masterclass",
      url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
      type: "playlist",
      channel: "Andrej Karpathy",
      duration: "Neural Networks: Zero to Hero",
    },
  ],

  dsa: [
    {
      title: "Striver's A2Z DSA Course — Step-by-Step Algorithmic Roadmap",
      url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
      type: "playlist",
      channel: "take U forward",
      duration: "450+ Curated Problems",
    },
    {
      title: "Dynamic Programming Master Series — 1D, 2D, Grids & Subsequences",
      url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY",
      type: "playlist",
      channel: "take U forward",
      duration: "Complete 56-Lecture Series",
    },
    {
      title: "Graph Algorithms Complete Course — BFS, DFS, Dijkstra, TopoSort & Disjoint Set",
      url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
      type: "video",
      channel: "Abdul Bari",
      duration: "Complete Algorithm Series",
    },
  ],
};
