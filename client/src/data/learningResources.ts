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
  thumbnailUrl?: string;
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
      title: "HTML Tutorial For Beginners In Hindi (With Notes)",
      url: "https://youtu.be/k2DSi1zGEc8?si=dUR-1Ll2ins7oWy-",
      type: "video",
      channel: "CodeWithHarry",
      duration: "Complete HTML Guide",
    },
    {
      title: "CSS Tutorial – Full Course for Beginners",
      url: "https://youtu.be/ESnrn1kAD4E?si=11bBIcidzhKmAhy_",
      type: "video",
      channel: "Dave Gray",
      duration: "11 Hours Masterclass",
    },
    {
      title: "JavaScript Advance Crash Course: Level Up Your Coding Skills!",
      url: "https://youtu.be/a-wVHL0lpb0?si=UQcb8RFxkj8yxLtW",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Advance JS Crash Course",
    },
    {
      title: "ReactJS - Learn Everything",
      url: "https://youtu.be/3LRZRSIh_KE?si=x1drF8gYaZrzu2fF",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Full React Masterclass",
    },
    {
      title: "The Only Three.js Tutorial You'll Ever Need (Shaders, R3F, Real Project)",
      url: "https://youtu.be/NGFhiCJEbdY?si=1HWbQu8GdLP4M7CQ",
      type: "video",
      channel: "Sheryians Creative School",
      duration: "11 Hours 3D Web Dev",
    },
    {
      title: "Complete Web Development Course 🔥",
      url: "https://youtube.com/playlist?list=PL63CCsaAKsJ9z1mnLvpY5NdGdyRiPkEsE&si=o36nYTdB5vV0FMNe",
      type: "playlist",
      channel: "Sheryians Coding School",
      duration: "Full Playlist Series",
      thumbnailUrl: "https://img.youtube.com/vi/ysqRj-l_v0w/hqdefault.jpg",
    },
  ],

  backend: [
    {
      title: "Master NodeJS Series",
      url: "https://youtube.com/playlist?list=PLinedj3B30sDby4Al-i13hQJGQoRQDfPo&si=zBFcMr7l0DwU3imk",
      type: "playlist",
      channel: "Piyush Garg",
      duration: "Complete Series",
      thumbnailUrl: "https://img.youtube.com/vi/ohIAiuHMKMI/hqdefault.jpg",
    },
    {
      title: "Express.js - Learn What Matters: Mastering the Framework",
      url: "https://youtu.be/pKJ4GGyDgJo?si=J8NAb0MZlOwzsmI0",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Complete Express Guide",
    },
    {
      title: "Ultimate Backend Development Course | Part 1 | Node, Express, MongoDB, Auth",
      url: "https://youtu.be/Ef2RtAxOb1Y?si=VRYZOe6CjU_259qo",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Part 1 Full Masterclass",
    },
    {
      title: "Ultimate Backend Development Course | Part 2 | Learn From Scratch",
      url: "https://youtu.be/OpCLg6FuD0M?si=BFuIPyE191xWrAuF",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Part 2 Advanced Topics",
    },
    {
      title: "Advanced Backend + AI Full Course | Docker, Redis, System Design, AWS, RAG",
      url: "https://youtu.be/_itqpLVS660?si=AJ_OcdIfm412ebOH",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Advanced Backend + AI Part 1",
    },
    {
      title: "Advanced Backend + AI Full Course | Part 2 | LangChain, RAG, Vector DB, AWS",
      url: "https://youtu.be/lweDf3_q-sk?si=1aM-fLwD14dmMI5u",
      type: "video",
      channel: "Sheryians Coding School",
      duration: "Advanced Backend + AI Part 2",
    },
  ],

  databases: [
    {
      title: "Master PostgreSQL in One Video: Beginner to Advanced Course",
      url: "https://youtu.be/cnzka7kF5Zk?si=kzgvZylDd-tMwlJy",
      type: "video",
      channel: "MPrashant TECH",
      duration: "Full PostgreSQL Masterclass",
    },
    {
      title: "SQL - Complete Course in 3 Hours | SQL One Shot using MySQL",
      url: "https://youtu.be/hlGoQC332VM?si=X9FUt5rTodXl0X8g",
      type: "video",
      channel: "Apna College",
      duration: "3 Hours One Shot",
    },
    {
      title: "MongoDB Playlist in Hindi (Complete Course 2026)",
      url: "https://youtube.com/playlist?list=PLA3GkZPtsafZydhN4nP0h7hw7PQuLsBv1&si=d1DTj1PKl5gimC50",
      type: "playlist",
      channel: "Engineering Digest",
      duration: "Complete Series",
      thumbnailUrl: "https://img.youtube.com/vi/4EjKroJCpFA/hqdefault.jpg",
    },
    {
      title: "Redis Master Series | Chai aur Code",
      url: "https://youtube.com/playlist?list=PLkravDUKJN0JWfllRfj0cEcTn2etynCdO&si=YcKw76wFGu9Eqwh-",
      type: "playlist",
      channel: "Chai aur Code",
      duration: "Complete Redis Series",
      thumbnailUrl: "https://img.youtube.com/vi/5YqP18Gyop0/hqdefault.jpg",
    },
    {
      title: "Data Modeling Masterclass | Build Uber's Data Model from Scratch",
      url: "https://youtu.be/RmugzY84iL4?si=A1XqL2kKwSHET0dc",
      type: "video",
      channel: "Darshil Parmar",
      duration: "System Data Modeling",
    },
  ],

  languages: [
    {
      title: "C Language Tutorial for Beginners (with Notes & Practice Questions)",
      url: "https://youtu.be/irqbmMNs2Bo?si=PILTAnRksFW2d61F",
      type: "video",
      channel: "Apna College",
      duration: "Complete C Course",
    },
    {
      title: "Complete C++ Tutorial in 1 Video (With Notes & Practice Problems)",
      url: "https://youtu.be/Z2oxGj36vZk?si=xSBHR8YWRW8hFUoa",
      type: "video",
      channel: "CodeHelp - by Babbar",
      duration: "Complete C++ Masterclass",
    },
    {
      title: "Java Programming Full Tutorial in One Video (Java Full Course)",
      url: "https://youtu.be/32DLasxoOiM?si=VoRS2coNxbUAAqgm",
      type: "video",
      channel: "CoDing SeeKho",
      duration: "Complete Java Masterclass",
    },
    {
      title: "Python Tutorial For Beginners in Hindi | Complete Python Course 🔥",
      url: "https://youtu.be/UrsmFxEIp5k?si=vNG_tHmmmzwZeSer",
      type: "video",
      channel: "CodeWithHarry",
      duration: "Complete Python Guide",
    },
  ],

  dataAnalyst: [
    {
      title: "Data Analysis Foundation Course",
      url: "https://youtube.com/playlist?list=PLaldQ9PzZd9pgZEBeIf0FYI4DEO1ibxPb&si=3pkvViq8tksQy0dP",
      type: "playlist",
      channel: "Sheryians AI School",
      duration: "Complete Foundation Playlist",
      thumbnailUrl: "https://img.youtube.com/vi/Zr0sNpeClV4/hqdefault.jpg",
    },
  ],

  aiml: [
    {
      title: "Complete Machine Learning Course with Projects | Learn ML Step-by-Step",
      url: "https://youtube.com/playlist?list=PLaldQ9PzZd9qT0KsKJ7yCq70iFFP3MFJ5&si=fQ461o7-jyEjqKqo",
      type: "playlist",
      channel: "Sheryians AI School",
      duration: "Complete ML Master Series",
      thumbnailUrl: "https://img.youtube.com/vi/1L420xXpDTg/hqdefault.jpg",
    },
  ],

  dsa: [
    {
      title: "DSA Patterns 2025 | Crack FAANG in 3 Months",
      url: "https://youtube.com/playlist?list=PLbJhGqY-mq47k_WLUtzVjmarUm1EuXPj2&si=iXWr6vr2-curJhC2",
      type: "playlist",
      channel: "Padho with Pratyush",
      duration: "DSA Patterns Series",
      thumbnailUrl: "https://img.youtube.com/vi/qH2VQY48mg4/hqdefault.jpg",
    },
    {
      title: "DSA in Java | Complete DSA Master Series",
      url: "https://youtube.com/playlist?list=PLqM7alHXFySGwOTADxwHrgH8m_XpgrB-k&si=P-uGgVUa-iq526D6",
      type: "playlist",
      channel: "GeeksforGeeks (Raghav Sir)",
      duration: "Complete Java DSA",
      thumbnailUrl: "https://img.youtube.com/vi/m3fg2PRY1u4/hqdefault.jpg",
    },
    {
      title: "Java DSA Series",
      url: "https://youtube.com/playlist?list=PLDzeHZWIZsTqNW1gvXXAicBgku9uPZeOC&si=Ixx662-H1S-fd5EO",
      type: "playlist",
      channel: "CodeHelp - by Babbar",
      duration: "Full Java DSA Course",
      thumbnailUrl: "https://img.youtube.com/vi/X2NVOSNBbxU/hqdefault.jpg",
    },
    {
      title: "Java + DSA + Interview Preparation Course",
      url: "https://youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ&si=JWd1DtkA12vOFrFc",
      type: "playlist",
      channel: "Kunal Kushwaha",
      duration: "Comprehensive DSA Bootcamp",
      thumbnailUrl: "https://img.youtube.com/vi/rZ41y93P2Qo/hqdefault.jpg",
    },
    {
      title: "Complete C++ DSA Course | Data Structures & Algorithms",
      url: "https://youtube.com/playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&si=2O7V4c-en0sNoDPH",
      type: "playlist",
      channel: "Apna College",
      duration: "Complete C++ DSA Series",
      thumbnailUrl: "https://img.youtube.com/vi/VTLCoHnyACE/hqdefault.jpg",
    },
    {
      title: "Complete C++ Placement DSA Course",
      url: "https://youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA&si=OFapPG-I6lOrvC0V",
      type: "playlist",
      channel: "CodeHelp - by Babbar",
      duration: "Complete 140+ Lecture Series",
      thumbnailUrl: "https://img.youtube.com/vi/WQoB2z67hvY/hqdefault.jpg",
    },
    {
      title: "Strivers A2Z-DSA Course | DSA Playlist | Placements",
      url: "https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&si=n6C1IavkiJBmDEJl",
      type: "playlist",
      channel: "take U forward",
      duration: "450+ Curated Problems",
      thumbnailUrl: "https://img.youtube.com/vi/0bHoB32fuj0/hqdefault.jpg",
    },
  ],
};
