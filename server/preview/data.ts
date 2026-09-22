export const previewLectures = [
  { id: "lecture-dp-03", videoId: "dQw4w9WgXcQ", title: "DP Lecture 03 · Memoization Deep Dive", durationSec: 2912, topic: "Dynamic Programming", language: "English + Hinglish", indexed: true },
  { id: "lecture-dp-05", videoId: "dQw4w9WgXcQ", title: "DP Lecture 05 · Tabulation Recipe", durationSec: 2488, topic: "Dynamic Programming", language: "English + Hinglish", indexed: true },
  { id: "lecture-arrays-07", videoId: "dQw4w9WgXcQ", title: "Arrays Lecture 07 · Sliding Window Patterns", durationSec: 3260, topic: "Arrays", language: "English + Hinglish", indexed: true },
] as const;

export const previewChunks = [
  { id: "dp-lecture-03-724", lectureId: "lecture-dp-03", startSec: 724, endSec: 882, text: "Memoization stores the answer for a state when recursion visits it; tabulation builds those states iteratively." },
  { id: "dp-lecture-05-271", lectureId: "lecture-dp-05", startSec: 271, endSec: 449, text: "Bottom-up tabulation removes the recursive call stack and makes the dependency order explicit." },
  { id: "arrays-lecture-07-516", lectureId: "lecture-arrays-07", startSec: 516, endSec: 703, text: "Sliding window is useful for contiguous ranges when the window state can be updated as pointers move." },
] as const;
