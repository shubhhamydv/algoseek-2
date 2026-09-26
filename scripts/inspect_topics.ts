import fs from "fs";

const lectures = JSON.parse(fs.readFileSync("data/pratyush/lectures.json", "utf-8"));
const topics = [
  "two pointer",
  "sliding window",
  "recursion",
  "graph",
  "dp",
  "reverse",
];

for (const t of topics) {
  const matches = lectures.filter((l: any) => l.title.toLowerCase().includes(t));
  console.log(`=== ${t.toUpperCase()} (${matches.length} matches) ===`);
  matches.slice(0, 3).forEach((m: any) => console.log(`- ${m.title} (ID: ${m.id})`));
}
