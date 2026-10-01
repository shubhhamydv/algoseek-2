/* ─── Auto-generated DSA Pattern Sheet ─── */

export interface ProblemLink {
  label: string;
  url: string;
  platform: "leetcode" | "geeksforgeeks" | "youtube" | "other";
}

export interface PracticeProblem {
  id: string;
  pattern: string;
  subCategory?: string;
  title: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  links: ProblemLink[];
}

export interface PatternGroup {
  id: string;
  name: string;
  problemCount: number;
  description: string;
  problems: PracticeProblem[];
}

export const DSA_PATTERNS: PatternGroup[] = [
  {
    "id": "two-pointers",
    "name": "Two Pointers",
    "problemCount": 12,
    "description": "Pointers converging or moving in lockstep across sorted arrays to locate pairs, triplets, and sub-ranges in O(N) time.",
    "problems": [
      {
        "id": "prob-1",
        "pattern": "Two Pointers",
        "title": "Pair with Target Sum",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-2",
        "pattern": "Two Pointers",
        "title": "Rearrange 0 and 1",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-3",
        "pattern": "Two Pointers",
        "title": "Remove Duplicates",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
            "platform": "leetcode",
            "label": "LeetCode (1)"
          },
          {
            "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/",
            "platform": "leetcode",
            "label": "LeetCode (2)"
          },
          {
            "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
            "platform": "leetcode",
            "label": "LeetCode (3)"
          }
        ]
      },
      {
        "id": "prob-4",
        "pattern": "Two Pointers",
        "title": "Squaring a Sorted Array",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/squares-of-a-sorted-array/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-5",
        "pattern": "Two Pointers",
        "title": "Triplet Sum to Zero",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/3sum/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-6",
        "pattern": "Two Pointers",
        "title": "Triplet Sum Close to Target",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/3sum-closest/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-7",
        "pattern": "Two Pointers",
        "title": "Triplets with Smaller Sum",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-8",
        "pattern": "Two Pointers",
        "title": "Subarrays with Product Less than a Target",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/subarray-product-less-than-k/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-9",
        "pattern": "Two Pointers",
        "title": "Dutch National Flag Problem",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/sort-colors/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-10",
        "pattern": "Two Pointers",
        "title": "Problem Challenge 1: Quadruple Sum to Target",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/4sum/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-11",
        "pattern": "Two Pointers",
        "title": "Problem Challenge 2: Comparing Strings containing Backspaces",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/backspace-string-compare/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-12",
        "pattern": "Two Pointers",
        "title": "Problem Challenge 3: Minimum Window Sort",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/",
            "platform": "leetcode",
            "label": "LeetCode (1)"
          },
          {
            "url": "https://www.ideserve.co.in/learn/minimum-length-subarray-sorting-which-results-in-sorted-array",
            "platform": "other",
            "label": "Link (2)"
          }
        ]
      }
    ]
  },
  {
    "id": "fast-slow-pointers",
    "name": "Fast & Slow Pointers",
    "problemCount": 8,
    "description": "Tortoise and Hare technique for detecting cycles, finding midpoints, and navigating linked lists with O(1) extra space.",
    "problems": [
      {
        "id": "prob-13",
        "pattern": "Fast & Slow Pointers",
        "title": "LinkedList Cycle",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/linked-list-cycle/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-14",
        "pattern": "Fast & Slow Pointers",
        "title": "Start of LinkedList Cycle",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/linked-list-cycle-ii/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-15",
        "pattern": "Fast & Slow Pointers",
        "title": "Happy Number",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/happy-number/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-16",
        "pattern": "Fast & Slow Pointers",
        "title": "FIND DUPLICATE NUMBER",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-the-duplicate-number/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-17",
        "pattern": "Fast & Slow Pointers",
        "title": "Middle of the LinkedList",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/middle-of-the-linked-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-18",
        "pattern": "Fast & Slow Pointers",
        "title": "Problem Challenge 1: Palindrome LinkedList",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/palindrome-linked-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-19",
        "pattern": "Fast & Slow Pointers",
        "title": "Problem Challenge 2: Rearrange a LinkedList",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/reorder-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-20",
        "pattern": "Fast & Slow Pointers",
        "title": "Problem Challenge 3: Cycle in a Circular Array",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/circular-array-loop/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "sliding-window",
    "name": "Sliding Window",
    "problemCount": 12,
    "description": "Expanding and contracting sub-array boundaries to compute maximum sums, longest substrings, and minimal window targets in linear time.",
    "problems": [
      {
        "id": "prob-21",
        "pattern": "Sliding Window",
        "title": "Maximum Sum Subarray of Size K",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-22",
        "pattern": "Sliding Window",
        "title": "Smallest Subarray with a given sum",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-size-subarray-sum/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-23",
        "pattern": "Sliding Window",
        "title": "Longest Substring with K Distinct Characters",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-24",
        "pattern": "Sliding Window",
        "title": "Fruits into Baskets",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/fruit-into-baskets/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-25",
        "pattern": "Sliding Window",
        "title": "No-repeat Substring",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-26",
        "pattern": "Sliding Window",
        "title": "Longest Substring with Same Letters after Replacement",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-repeating-character-replacement/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-27",
        "pattern": "Sliding Window",
        "title": "Longest Subarray with Ones after Replacement",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/max-consecutive-ones-iii/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-28",
        "pattern": "Sliding Window",
        "title": "Minimum size subarray SUM",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-size-subarray-sum/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-29",
        "pattern": "Sliding Window",
        "title": "MInimum Size Substring",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-interview-150",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-30",
        "pattern": "Sliding Window",
        "title": "Problem Challenge 1: Permutation in a String",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/permutation-in-string/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-31",
        "pattern": "Sliding Window",
        "title": "Problem Challenge 2: String Anagrams",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-32",
        "pattern": "Sliding Window",
        "title": "Problem Challenge 4: Words Concatenation",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/substring-with-concatenation-of-all-words/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "kadane-pattern",
    "name": "Kadane Pattern",
    "problemCount": 6,
    "description": "Dynamic tracking of maximum and minimum contiguous subarray sums and products in a single forward pass.",
    "problems": [
      {
        "id": "prob-33",
        "pattern": "Kadane Pattern",
        "title": "Maximum subarray sum",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-subarray/?utm_source=chatgpt.com",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-34",
        "pattern": "Kadane Pattern",
        "title": "Minimum Subarray Sum",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-35",
        "pattern": "Kadane Pattern",
        "title": "Maximum product subarray",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-product-subarray/?utm_source=chatgpt.com",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-36",
        "pattern": "Kadane Pattern",
        "title": "Maximum subarray sum with one deletion",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-37",
        "pattern": "Kadane Pattern",
        "title": "Maximum absolute sum of any subarray",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-38",
        "pattern": "Kadane Pattern",
        "title": "Maximum sum in circular array variant",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-sum-circular-subarray/?utm_source=chatgpt.com",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "prefix-sum",
    "name": "Prefix Sum",
    "problemCount": 6,
    "description": "Precomputed cumulative sums enabling O(1) subarray query evaluations and hash-map frequency counting.",
    "problems": [
      {
        "id": "prob-39",
        "pattern": "Prefix Sum",
        "title": "Subarray Sum Equals K",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/subarray-sum-equals-k/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-40",
        "pattern": "Prefix Sum",
        "title": "Find Pivot Index",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-pivot-index/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-41",
        "pattern": "Prefix Sum",
        "title": "Subarray Sums Divisible By K",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/subarray-sums-divisible-by-k/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-42",
        "pattern": "Prefix Sum",
        "title": "Contiguous array",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/contiguous-array/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-43",
        "pattern": "Prefix Sum",
        "title": "Problem challenge: Shortest Subarray With Sum at Least K",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-44",
        "pattern": "Prefix Sum",
        "title": "Problem challenge: Count Range Sum",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/count-of-range-sum/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "merge-intervals",
    "name": "Merge Intervals",
    "problemCount": 7,
    "description": "Sorting and combining overlapping ranges, meeting times, and continuous scheduling blocks.",
    "problems": [
      {
        "id": "prob-45",
        "pattern": "Merge Intervals",
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/merge-intervals/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-46",
        "pattern": "Merge Intervals",
        "title": "Insert Interval",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/insert-interval/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-47",
        "pattern": "Merge Intervals",
        "title": "Intervals Intersection",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/interval-list-intersections/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-48",
        "pattern": "Merge Intervals",
        "title": "Overlapping Intervals",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-49",
        "pattern": "Merge Intervals",
        "title": "Problem Challenge 1: Minimum Meeting Rooms",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-50",
        "pattern": "Merge Intervals",
        "title": "Problem Challenge 2: Maximum CPU Load",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-51",
        "pattern": "Merge Intervals",
        "title": "Problem Challenge 3: Employee Free Time",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://www.codertrain.co/employee-free-time",
            "platform": "other",
            "label": "Link"
          }
        ]
      }
    ]
  },
  {
    "id": "in-place-reversal-of-linkedlist",
    "name": "In-place Reversal of LinkedList",
    "problemCount": 6,
    "description": "Pointers manipulation to reverse lists, sublists, and k-sized groups without allocating new nodes.",
    "problems": [
      {
        "id": "prob-52",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Reverse a LinkedList",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/reverse-linked-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-53",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Reverse a Sub-list",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/reverse-linked-list-ii/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-54",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Reverse List in Pairs",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/swap-nodes-in-pairs/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-55",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Reverse every K-element Sub-list",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-56",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Problem Challenge 1: Reverse nodes in EVEN Length Groups",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-57",
        "pattern": "In-place Reversal of LinkedList",
        "title": "Problem Challenge 2: Rotate a LinkedList",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/rotate-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "stack",
    "name": "Stack",
    "problemCount": 9,
    "description": "LIFO structures for monotonic next-greater evaluations, parentheses verification, and nested bracket parsing.",
    "problems": [
      {
        "id": "prob-58",
        "pattern": "Stack",
        "title": "remove adjacent duplicates",
        "links": [
          {
            "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-59",
        "pattern": "Stack",
        "title": "Balanced Parentheses",
        "links": [
          {
            "url": "https://leetcode.com/problems/valid-parentheses/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-60",
        "pattern": "Stack",
        "title": "Reverse a String",
        "links": [
          {
            "url": "https://leetcode.com/problems/reverse-string/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          },
          {
            "url": "https://www.geeksforgeeks.org/problems/reverse-a-string/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-61",
        "pattern": "Stack",
        "title": "Next Greater Element",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/next-greater-element-ii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-62",
        "pattern": "Stack",
        "title": "Daily Temperatures",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/daily-temperatures/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-63",
        "pattern": "Stack",
        "title": "Remove Nodes From Linked List",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/remove-nodes-from-linked-list/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-64",
        "pattern": "Stack",
        "title": "Remove All Adjacent Duplicates in String II",
        "difficulty": "Medium",
        "links": [
          {
            "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-65",
        "pattern": "Stack",
        "title": "Simplify Path (Challenge)",
        "links": [
          {
            "url": "https://leetcode.com/problems/simplify-path/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-66",
        "pattern": "Stack",
        "title": "Remove K DigitsProblem challenge",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/remove-k-digits/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "hash-maps",
    "name": "Hash Maps",
    "problemCount": 4,
    "description": "O(1) dictionary lookups for frequency counting, duplicate detection, and anagram validation.",
    "problems": [
      {
        "id": "prob-67",
        "pattern": "Hash Maps",
        "title": "First Non-repeating Character",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/first-unique-character-in-a-string/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-68",
        "pattern": "Hash Maps",
        "title": "Maximum Number of Balloons",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-number-of-balloons/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-69",
        "pattern": "Hash Maps",
        "title": "Longest Palindrome",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-palindrome/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-70",
        "pattern": "Hash Maps",
        "title": "Ransom Note",
        "difficulty": "Easy",
        "links": [
          {
            "url": "https://leetcode.com/problems/ransom-note/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "binary-search",
    "name": "Binary Search",
    "problemCount": 23,
    "description": "Logarithmic O(log N) search on sorted arrays, search-space reduction, and binary search on answer bounds.",
    "problems": [
      {
        "id": "prob-71",
        "pattern": "Binary Search",
        "title": "Binary search basic",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-search/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-72",
        "pattern": "Binary Search",
        "title": "Upper Bound/ Ceiling",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-73",
        "pattern": "Binary Search",
        "title": "First and Last position",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-74",
        "pattern": "Binary Search",
        "title": "Count number of occurences",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-75",
        "pattern": "Binary Search",
        "title": "Search in infinite Sorted array",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-76",
        "pattern": "Binary Search",
        "title": "Peak index in Mountain",
        "links": [
          {
            "url": "https://leetcode.com/problems/peak-index-in-a-mountain-array/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-77",
        "pattern": "Binary Search",
        "title": "Find peak in mountain range",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-peak-element/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-78",
        "pattern": "Binary Search",
        "title": "Find minimum in rotated sorted array",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-79",
        "pattern": "Binary Search",
        "title": "Find number of rotations to sorted array",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/rotation4723/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-80",
        "pattern": "Binary Search",
        "title": "Search in rotated sorted array",
        "links": [
          {
            "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-81",
        "pattern": "Binary Search",
        "title": "KOKO eating BANANAS",
        "links": [
          {
            "url": "https://leetcode.com/problems/koko-eating-bananas/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-82",
        "pattern": "Binary Search",
        "title": "Min num of days to make m bouquets",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-83",
        "pattern": "Binary Search",
        "title": "Aggresive cows",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-84",
        "pattern": "Binary Search",
        "title": "H index 2",
        "links": [
          {
            "url": "https://leetcode.com/problems/h-index-ii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-85",
        "pattern": "Binary Search",
        "title": "Max candies to k children",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-86",
        "pattern": "Binary Search",
        "title": "Capacity to ship packages in d days",
        "links": [
          {
            "url": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-87",
        "pattern": "Binary Search",
        "title": "Book Allocation Problem",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-88",
        "pattern": "Binary Search",
        "title": "Split largest arrray",
        "links": [
          {
            "url": "https://leetcode.com/problems/split-array-largest-sum/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-89",
        "pattern": "Binary Search",
        "title": "Search 2 D matrix",
        "links": [
          {
            "url": "https://leetcode.com/problems/search-a-2d-matrix/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-90",
        "pattern": "Binary Search",
        "title": "Search 2D matrix",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/search-a-2d-matrix-ii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-91",
        "pattern": "Binary Search",
        "title": "kth smallest in sorted matrix",
        "links": [
          {
            "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-92",
        "pattern": "Binary Search",
        "title": "kth smallest in multiplication matrix",
        "links": [
          {
            "url": "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-93",
        "pattern": "Binary Search",
        "title": "median of 2 sorted arrays",
        "links": [
          {
            "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "heap-pattern",
    "name": "Heap Pattern",
    "problemCount": 17,
    "description": "Priority queue logic for Top-K frequent elements, K-way merges, median maintenance, and greedy scheduling.",
    "problems": [
      {
        "id": "prob-94",
        "pattern": "Heap Pattern",
        "subCategory": "Kth",
        "title": "kth smallest",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-95",
        "pattern": "Heap Pattern",
        "subCategory": "Kth",
        "title": "kth largest",
        "links": [
          {
            "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-96",
        "pattern": "Heap Pattern",
        "subCategory": "Kth",
        "title": "TOP K frequent Elements",
        "links": [
          {
            "url": "https://leetcode.com/problems/top-k-frequent-elements/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-97",
        "pattern": "Heap Pattern",
        "subCategory": "Kth",
        "title": "Top K frequent Words",
        "links": [
          {
            "url": "https://leetcode.com/problems/top-k-frequent-words/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-98",
        "pattern": "Heap Pattern",
        "subCategory": "K closest",
        "title": "K closest points to origin",
        "links": [
          {
            "url": "https://leetcode.com/problems/k-closest-points-to-origin/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-99",
        "pattern": "Heap Pattern",
        "subCategory": "K closest",
        "title": "Find K closest elements",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-k-closest-elements/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-100",
        "pattern": "Heap Pattern",
        "subCategory": "K closest",
        "title": "Kth weakest row in Matrix",
        "links": [
          {
            "url": "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-101",
        "pattern": "Heap Pattern",
        "subCategory": "heap as pointer",
        "title": "Merge K Sorted Arrays",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-102",
        "pattern": "Heap Pattern",
        "subCategory": "heap as pointer",
        "title": "Kth Smallest in Sorted Matrix",
        "links": [
          {
            "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-103",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "LAST STONE WEIGHT",
        "links": [
          {
            "url": "https://leetcode.com/problems/last-stone-weight/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-104",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "CPU Task Scheduler",
        "links": [
          {
            "url": "https://leetcode.com/problems/task-scheduler/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-105",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "Reorganize String",
        "links": [
          {
            "url": "https://leetcode.com/problems/reorganize-string/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-106",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "Min number of refueling stops",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-number-of-refueling-stops/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-107",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "IPO",
        "links": [
          {
            "url": "https://leetcode.com/problems/ipo/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-108",
        "pattern": "Heap Pattern",
        "subCategory": "GREEDY+heap",
        "title": "Course Scheduler 3",
        "links": [
          {
            "url": "https://leetcode.com/problems/course-schedule-iii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-109",
        "pattern": "Heap Pattern",
        "subCategory": "2 heaps",
        "title": "Find median in data stream",
        "links": [
          {
            "url": "https://leetcode.com/problems/find-median-from-data-stream/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-110",
        "pattern": "Heap Pattern",
        "subCategory": "2 heaps",
        "title": "Sliding Window Median",
        "difficulty": "Hard",
        "links": [
          {
            "url": "https://leetcode.com/problems/sliding-window-median/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "recursion-backtracking",
    "name": "Recursion & Backtracking",
    "problemCount": 10,
    "description": "State exploration, decision trees, subsets, permutations, and combinatorial generation.",
    "problems": [
      {
        "id": "prob-111",
        "pattern": "Recursion & Backtracking",
        "title": "Fibonnaci",
        "links": [
          {
            "url": "https://leetcode.com/problems/fibonacci-number/description/",
            "platform": "leetcode",
            "label": "LeetCode (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=j4wjZqzhMqc&t",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-112",
        "pattern": "Recursion & Backtracking",
        "title": "Check if string is Pallindrome",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/palindrome-string0817/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=j4wjZqzhMqc&t",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-113",
        "pattern": "Recursion & Backtracking",
        "title": "Check if Array is Sorted",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-114",
        "pattern": "Recursion & Backtracking",
        "title": "Sum of digits of a number",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-115",
        "pattern": "Recursion & Backtracking",
        "title": "Remove occurences of a character in string",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-116",
        "pattern": "Recursion & Backtracking",
        "title": "Generate parenthesis",
        "links": [
          {
            "url": "https://leetcode.com/problems/generate-parentheses/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-117",
        "pattern": "Recursion & Backtracking",
        "title": "Letter Combinations of phone number",
        "links": [
          {
            "url": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/",
            "platform": "leetcode",
            "label": "LeetCode (1)"
          },
          {
            "url": "https://www.youtube.com/watch?v=IKfIT6uFOcs",
            "platform": "youtube",
            "label": "Video Solution (2)"
          }
        ]
      },
      {
        "id": "prob-118",
        "pattern": "Recursion & Backtracking",
        "title": "Permutations",
        "links": [
          {
            "url": "https://leetcode.com/problems/permutations/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-119",
        "pattern": "Recursion & Backtracking",
        "title": "Combination Sum",
        "links": [
          {
            "url": "https://leetcode.com/problems/combination-sum/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-120",
        "pattern": "Recursion & Backtracking",
        "title": "Pallindrome partition",
        "links": [
          {
            "url": "https://leetcode.com/problems/palindrome-partitioning/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "tree-pattern",
    "name": "Tree Pattern",
    "problemCount": 31,
    "description": "DFS, BFS, traversals, binary search trees, symmetry validation, and lowest common ancestor queries.",
    "problems": [
      {
        "id": "prob-121",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "Inorder",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-122",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "Preorder",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-123",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "Postorder",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-124",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "Level Order",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-125",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "ZigZag Order",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-126",
        "pattern": "Tree Pattern",
        "subCategory": "Traversal",
        "title": "Level Order II",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-127",
        "pattern": "Tree Pattern",
        "subCategory": "Mirror and Symmetry",
        "title": "Invert Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/invert-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-128",
        "pattern": "Tree Pattern",
        "subCategory": "Mirror and Symmetry",
        "title": "Symmetric Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/symmetric-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-129",
        "pattern": "Tree Pattern",
        "subCategory": "Mirror and Symmetry",
        "title": "Same Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/same-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-130",
        "pattern": "Tree Pattern",
        "subCategory": "Mirror and Symmetry",
        "title": "Subtree of another TREE",
        "links": [
          {
            "url": "https://leetcode.com/problems/subtree-of-another-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-131",
        "pattern": "Tree Pattern",
        "subCategory": "Mirror and Symmetry",
        "title": "Flip Equivalent Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/flip-equivalent-binary-trees/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-132",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "LCA of Binary TREE",
        "links": [
          {
            "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-133",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "Binary Search Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-134",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "LCA of BST",
        "links": [
          {
            "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-135",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "LCA of Deepest Leaves",
        "links": [
          {
            "url": "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-136",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "Two Sum IV",
        "links": [
          {
            "url": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-137",
        "pattern": "Tree Pattern",
        "subCategory": "Search",
        "title": "Kth smallest element in BST",
        "links": [
          {
            "url": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-138",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Minimum Depth of Binary Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-depth-of-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-139",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Maximum Depth of Binary Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-140",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Balanced Binary Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/balanced-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-141",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Diameter of Binary Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/diameter-of-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-142",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Check Completeness of Binary Tree",
        "links": [
          {
            "url": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-143",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Validate BST",
        "links": [
          {
            "url": "https://leetcode.com/problems/validate-binary-search-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-144",
        "pattern": "Tree Pattern",
        "subCategory": "Validation",
        "title": "Recover BST",
        "links": [
          {
            "url": "https://leetcode.com/problems/recover-binary-search-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-145",
        "pattern": "Tree Pattern",
        "subCategory": "Path SUM",
        "title": "Path Sum",
        "links": [
          {
            "url": "https://leetcode.com/problems/path-sum/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-146",
        "pattern": "Tree Pattern",
        "subCategory": "Path SUM",
        "title": "Path Sum II",
        "links": [
          {
            "url": "https://leetcode.com/problems/path-sum-ii/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-147",
        "pattern": "Tree Pattern",
        "subCategory": "Path SUM",
        "title": "Sum of Root to Leaf",
        "links": [
          {
            "url": "https://leetcode.com/problems/sum-root-to-leaf-numbers/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-148",
        "pattern": "Tree Pattern",
        "subCategory": "Path SUM",
        "title": "Maximum Path Sum",
        "links": [
          {
            "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-149",
        "pattern": "Tree Pattern",
        "subCategory": "Construction",
        "title": "Contruct tree from preorder and inorder",
        "links": [
          {
            "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-150",
        "pattern": "Tree Pattern",
        "subCategory": "Construction",
        "title": "Contruct tree from postorder and inorder",
        "links": [
          {
            "url": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-151",
        "pattern": "Tree Pattern",
        "subCategory": "Construction",
        "title": "Sorted Array to BST",
        "links": [
          {
            "url": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "graphs",
    "name": "Graphs",
    "problemCount": 20,
    "description": "Adjacency lists, BFS shortest paths, DFS connectivity, topological sort, Dijkstra, and minimum spanning trees.",
    "problems": [
      {
        "id": "prob-152",
        "pattern": "Graphs",
        "title": "Construct Adjancency List from EDGES+Nodes",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-153",
        "pattern": "Graphs",
        "title": "Graph DFS",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-154",
        "pattern": "Graphs",
        "title": "GRAPH BFS",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-155",
        "pattern": "Graphs",
        "title": "Number of Islands",
        "links": [
          {
            "url": "https://leetcode.com/problems/number-of-islands/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-156",
        "pattern": "Graphs",
        "title": "Number of Provinces",
        "links": [
          {
            "url": "https://leetcode.com/problems/number-of-provinces/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-157",
        "pattern": "Graphs",
        "title": "Rotten Oranges",
        "links": [
          {
            "url": "https://leetcode.com/problems/rotting-oranges/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-158",
        "pattern": "Graphs",
        "title": "Cycle detection in undirected graph",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-159",
        "pattern": "Graphs",
        "title": "Cycle detection in directed graph",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-160",
        "pattern": "Graphs",
        "title": "Topological sort",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/topological-sort/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-161",
        "pattern": "Graphs",
        "title": "Bipartite Graph/ Graph Coloring",
        "links": [
          {
            "url": "https://leetcode.com/problems/is-graph-bipartite/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-162",
        "pattern": "Graphs",
        "title": "Surrounded Regoins",
        "links": [
          {
            "url": "https://leetcode.com/problems/surrounded-regions/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-163",
        "pattern": "Graphs",
        "title": "Shortest Path in Non-Weighted Graph",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-164",
        "pattern": "Graphs",
        "title": "Dijkstra's Algorithm",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-165",
        "pattern": "Graphs",
        "title": "Network Delay",
        "links": [
          {
            "url": "https://leetcode.com/problems/network-delay-time/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-166",
        "pattern": "Graphs",
        "title": "Path With Minimum Effort",
        "links": [
          {
            "url": "https://leetcode.com/problems/path-with-minimum-effort/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-167",
        "pattern": "Graphs",
        "title": "Swim in Rising Water",
        "links": [
          {
            "url": "https://leetcode.com/problems/swim-in-rising-water/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-168",
        "pattern": "Graphs",
        "title": "Bellman ford",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-169",
        "pattern": "Graphs",
        "title": "Cheapest Path in K stops",
        "links": [
          {
            "url": "https://leetcode.com/problems/cheapest-flights-within-k-stops/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-170",
        "pattern": "Graphs",
        "title": "Prim MST",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-171",
        "pattern": "Graphs",
        "title": "Word Ladder",
        "links": [
          {
            "url": "https://leetcode.com/problems/word-ladder/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      }
    ]
  },
  {
    "id": "dynamic-programming-dp-",
    "name": "Dynamic Programming (DP)",
    "problemCount": 18,
    "description": "Overlapping subproblems solved via memoization and bottom-up tabulation for knapsack, LIS, LCS, and stocks.",
    "problems": [
      {
        "id": "prob-172",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode-02: Fibonacci",
        "links": [
          {
            "url": "https://leetcode.com/problems/fibonacci-number/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-173",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 03: Climbing Stairs",
        "links": [
          {
            "url": "https://leetcode.com/problems/climbing-stairs/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-174",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 04: House Robber",
        "links": [
          {
            "url": "https://leetcode.com/problems/house-robber/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-175",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 05: 0/1 Knapsack",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-176",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 06: tabulation Intro",
        "links": [
          {
            "url": "https://leetcode.com/problems/climbing-stairs/description/",
            "platform": "leetcode",
            "label": "LeetCode (Tabulation)"
          }
        ]
      },
      {
        "id": "prob-177",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 07: 0/1 Knapsack Tabulation",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-178",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 08: Subset sum",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-179",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 09 : Target Sum",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/target-sum-1626326450/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      },
      {
        "id": "prob-180",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 10 : LIS",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-increasing-subsequence/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-181",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 11 : LIS Tabulation",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-increasing-subsequence/description/",
            "platform": "leetcode",
            "label": "LeetCode (LIS Tabulation)"
          }
        ]
      },
      {
        "id": "prob-182",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 12 : LCS",
        "links": [
          {
            "url": "https://leetcode.com/problems/longest-common-subsequence/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-183",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 13 : Unique Paths",
        "links": [
          {
            "url": "https://leetcode.com/problems/unique-paths/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-184",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 14: Buy Sell Stocks",
        "links": [
          {
            "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-185",
        "pattern": "Dynamic Programming (DP)",
        "title": "Best Time To Buy And Sell Stock Ii",
        "links": [
          {
            "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-186",
        "pattern": "Dynamic Programming (DP)",
        "title": "Best Time To Buy And Sell Stock Iii",
        "links": [
          {
            "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-187",
        "pattern": "Dynamic Programming (DP)",
        "title": "Best Time To Buy And Sell Stock Iv",
        "links": [
          {
            "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-188",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 15: MIn cost to cut stick",
        "links": [
          {
            "url": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-189",
        "pattern": "Dynamic Programming (DP)",
        "title": "Episode 16: Revision",
        "links": [
          {
            "url": "https://leetcode.com/problems/coin-change/description/",
            "platform": "leetcode",
            "label": "LeetCode (DP Revision)"
          }
        ]
      }
    ]
  },
  {
    "id": "greedy",
    "name": "Greedy",
    "problemCount": 4,
    "description": "Locally optimal choices leading to globally optimal solutions for intervals, gas refueling, and jumps.",
    "problems": [
      {
        "id": "prob-190",
        "pattern": "Greedy",
        "title": "Lemonade",
        "links": [
          {
            "url": "https://leetcode.com/problems/lemonade-change/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-191",
        "pattern": "Greedy",
        "title": "Jump Game",
        "links": [
          {
            "url": "https://leetcode.com/problems/jump-game/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-192",
        "pattern": "Greedy",
        "title": "Assign cookies",
        "links": [
          {
            "url": "https://leetcode.com/problems/assign-cookies/description/",
            "platform": "leetcode",
            "label": "LeetCode"
          }
        ]
      },
      {
        "id": "prob-193",
        "pattern": "Greedy",
        "title": "Fractional Knapsack",
        "links": [
          {
            "url": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
            "platform": "geeksforgeeks",
            "label": "GeeksforGeeks"
          }
        ]
      }
    ]
  }
];

export const ALL_PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    "id": "prob-1",
    "pattern": "Two Pointers",
    "title": "Pair with Target Sum",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-2",
    "pattern": "Two Pointers",
    "title": "Rearrange 0 and 1",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-3",
    "pattern": "Two Pointers",
    "title": "Remove Duplicates",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
        "platform": "leetcode",
        "label": "LeetCode (1)"
      },
      {
        "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/",
        "platform": "leetcode",
        "label": "LeetCode (2)"
      },
      {
        "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
        "platform": "leetcode",
        "label": "LeetCode (3)"
      }
    ]
  },
  {
    "id": "prob-4",
    "pattern": "Two Pointers",
    "title": "Squaring a Sorted Array",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/squares-of-a-sorted-array/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-5",
    "pattern": "Two Pointers",
    "title": "Triplet Sum to Zero",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/3sum/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-6",
    "pattern": "Two Pointers",
    "title": "Triplet Sum Close to Target",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/3sum-closest/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-7",
    "pattern": "Two Pointers",
    "title": "Triplets with Smaller Sum",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-8",
    "pattern": "Two Pointers",
    "title": "Subarrays with Product Less than a Target",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/subarray-product-less-than-k/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-9",
    "pattern": "Two Pointers",
    "title": "Dutch National Flag Problem",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/sort-colors/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-10",
    "pattern": "Two Pointers",
    "title": "Problem Challenge 1: Quadruple Sum to Target",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/4sum/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-11",
    "pattern": "Two Pointers",
    "title": "Problem Challenge 2: Comparing Strings containing Backspaces",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/backspace-string-compare/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-12",
    "pattern": "Two Pointers",
    "title": "Problem Challenge 3: Minimum Window Sort",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/",
        "platform": "leetcode",
        "label": "LeetCode (1)"
      },
      {
        "url": "https://www.ideserve.co.in/learn/minimum-length-subarray-sorting-which-results-in-sorted-array",
        "platform": "other",
        "label": "Link (2)"
      }
    ]
  },
  {
    "id": "prob-13",
    "pattern": "Fast & Slow Pointers",
    "title": "LinkedList Cycle",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/linked-list-cycle/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-14",
    "pattern": "Fast & Slow Pointers",
    "title": "Start of LinkedList Cycle",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/linked-list-cycle-ii/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-15",
    "pattern": "Fast & Slow Pointers",
    "title": "Happy Number",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/happy-number/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-16",
    "pattern": "Fast & Slow Pointers",
    "title": "FIND DUPLICATE NUMBER",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-the-duplicate-number/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-17",
    "pattern": "Fast & Slow Pointers",
    "title": "Middle of the LinkedList",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-18",
    "pattern": "Fast & Slow Pointers",
    "title": "Problem Challenge 1: Palindrome LinkedList",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/palindrome-linked-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-19",
    "pattern": "Fast & Slow Pointers",
    "title": "Problem Challenge 2: Rearrange a LinkedList",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/reorder-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-20",
    "pattern": "Fast & Slow Pointers",
    "title": "Problem Challenge 3: Cycle in a Circular Array",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/circular-array-loop/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-21",
    "pattern": "Sliding Window",
    "title": "Maximum Sum Subarray of Size K",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-22",
    "pattern": "Sliding Window",
    "title": "Smallest Subarray with a given sum",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-size-subarray-sum/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-23",
    "pattern": "Sliding Window",
    "title": "Longest Substring with K Distinct Characters",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-24",
    "pattern": "Sliding Window",
    "title": "Fruits into Baskets",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/fruit-into-baskets/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-25",
    "pattern": "Sliding Window",
    "title": "No-repeat Substring",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-26",
    "pattern": "Sliding Window",
    "title": "Longest Substring with Same Letters after Replacement",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-repeating-character-replacement/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-27",
    "pattern": "Sliding Window",
    "title": "Longest Subarray with Ones after Replacement",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/max-consecutive-ones-iii/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-28",
    "pattern": "Sliding Window",
    "title": "Minimum size subarray SUM",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-size-subarray-sum/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-29",
    "pattern": "Sliding Window",
    "title": "MInimum Size Substring",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-interview-150",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-30",
    "pattern": "Sliding Window",
    "title": "Problem Challenge 1: Permutation in a String",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/permutation-in-string/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-31",
    "pattern": "Sliding Window",
    "title": "Problem Challenge 2: String Anagrams",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-32",
    "pattern": "Sliding Window",
    "title": "Problem Challenge 4: Words Concatenation",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/substring-with-concatenation-of-all-words/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-33",
    "pattern": "Kadane Pattern",
    "title": "Maximum subarray sum",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-subarray/?utm_source=chatgpt.com",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-34",
    "pattern": "Kadane Pattern",
    "title": "Minimum Subarray Sum",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-35",
    "pattern": "Kadane Pattern",
    "title": "Maximum product subarray",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-product-subarray/?utm_source=chatgpt.com",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-36",
    "pattern": "Kadane Pattern",
    "title": "Maximum subarray sum with one deletion",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-37",
    "pattern": "Kadane Pattern",
    "title": "Maximum absolute sum of any subarray",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-38",
    "pattern": "Kadane Pattern",
    "title": "Maximum sum in circular array variant",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-sum-circular-subarray/?utm_source=chatgpt.com",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-39",
    "pattern": "Prefix Sum",
    "title": "Subarray Sum Equals K",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/subarray-sum-equals-k/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-40",
    "pattern": "Prefix Sum",
    "title": "Find Pivot Index",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-pivot-index/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-41",
    "pattern": "Prefix Sum",
    "title": "Subarray Sums Divisible By K",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/subarray-sums-divisible-by-k/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-42",
    "pattern": "Prefix Sum",
    "title": "Contiguous array",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/contiguous-array/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-43",
    "pattern": "Prefix Sum",
    "title": "Problem challenge: Shortest Subarray With Sum at Least K",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-44",
    "pattern": "Prefix Sum",
    "title": "Problem challenge: Count Range Sum",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/count-of-range-sum/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-45",
    "pattern": "Merge Intervals",
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/merge-intervals/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-46",
    "pattern": "Merge Intervals",
    "title": "Insert Interval",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/insert-interval/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-47",
    "pattern": "Merge Intervals",
    "title": "Intervals Intersection",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/interval-list-intersections/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-48",
    "pattern": "Merge Intervals",
    "title": "Overlapping Intervals",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-49",
    "pattern": "Merge Intervals",
    "title": "Problem Challenge 1: Minimum Meeting Rooms",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-50",
    "pattern": "Merge Intervals",
    "title": "Problem Challenge 2: Maximum CPU Load",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-51",
    "pattern": "Merge Intervals",
    "title": "Problem Challenge 3: Employee Free Time",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://www.codertrain.co/employee-free-time",
        "platform": "other",
        "label": "Link"
      }
    ]
  },
  {
    "id": "prob-52",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Reverse a LinkedList",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/reverse-linked-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-53",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Reverse a Sub-list",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-54",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Reverse List in Pairs",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/swap-nodes-in-pairs/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-55",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Reverse every K-element Sub-list",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-56",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Problem Challenge 1: Reverse nodes in EVEN Length Groups",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-57",
    "pattern": "In-place Reversal of LinkedList",
    "title": "Problem Challenge 2: Rotate a LinkedList",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/rotate-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-58",
    "pattern": "Stack",
    "title": "remove adjacent duplicates",
    "links": [
      {
        "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-59",
    "pattern": "Stack",
    "title": "Balanced Parentheses",
    "links": [
      {
        "url": "https://leetcode.com/problems/valid-parentheses/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-60",
    "pattern": "Stack",
    "title": "Reverse a String",
    "links": [
      {
        "url": "https://leetcode.com/problems/reverse-string/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      },
      {
        "url": "https://www.geeksforgeeks.org/problems/reverse-a-string/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-61",
    "pattern": "Stack",
    "title": "Next Greater Element",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/next-greater-element-ii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-62",
    "pattern": "Stack",
    "title": "Daily Temperatures",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/daily-temperatures/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-63",
    "pattern": "Stack",
    "title": "Remove Nodes From Linked List",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/remove-nodes-from-linked-list/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-64",
    "pattern": "Stack",
    "title": "Remove All Adjacent Duplicates in String II",
    "difficulty": "Medium",
    "links": [
      {
        "url": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-65",
    "pattern": "Stack",
    "title": "Simplify Path (Challenge)",
    "links": [
      {
        "url": "https://leetcode.com/problems/simplify-path/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-66",
    "pattern": "Stack",
    "title": "Remove K DigitsProblem challenge",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/remove-k-digits/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-67",
    "pattern": "Hash Maps",
    "title": "First Non-repeating Character",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/first-unique-character-in-a-string/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-68",
    "pattern": "Hash Maps",
    "title": "Maximum Number of Balloons",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-number-of-balloons/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-69",
    "pattern": "Hash Maps",
    "title": "Longest Palindrome",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-palindrome/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-70",
    "pattern": "Hash Maps",
    "title": "Ransom Note",
    "difficulty": "Easy",
    "links": [
      {
        "url": "https://leetcode.com/problems/ransom-note/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-71",
    "pattern": "Binary Search",
    "title": "Binary search basic",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-search/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-72",
    "pattern": "Binary Search",
    "title": "Upper Bound/ Ceiling",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-73",
    "pattern": "Binary Search",
    "title": "First and Last position",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-74",
    "pattern": "Binary Search",
    "title": "Count number of occurences",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-75",
    "pattern": "Binary Search",
    "title": "Search in infinite Sorted array",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-76",
    "pattern": "Binary Search",
    "title": "Peak index in Mountain",
    "links": [
      {
        "url": "https://leetcode.com/problems/peak-index-in-a-mountain-array/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-77",
    "pattern": "Binary Search",
    "title": "Find peak in mountain range",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-peak-element/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-78",
    "pattern": "Binary Search",
    "title": "Find minimum in rotated sorted array",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-79",
    "pattern": "Binary Search",
    "title": "Find number of rotations to sorted array",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/rotation4723/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-80",
    "pattern": "Binary Search",
    "title": "Search in rotated sorted array",
    "links": [
      {
        "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-81",
    "pattern": "Binary Search",
    "title": "KOKO eating BANANAS",
    "links": [
      {
        "url": "https://leetcode.com/problems/koko-eating-bananas/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-82",
    "pattern": "Binary Search",
    "title": "Min num of days to make m bouquets",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-83",
    "pattern": "Binary Search",
    "title": "Aggresive cows",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-84",
    "pattern": "Binary Search",
    "title": "H index 2",
    "links": [
      {
        "url": "https://leetcode.com/problems/h-index-ii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-85",
    "pattern": "Binary Search",
    "title": "Max candies to k children",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-86",
    "pattern": "Binary Search",
    "title": "Capacity to ship packages in d days",
    "links": [
      {
        "url": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-87",
    "pattern": "Binary Search",
    "title": "Book Allocation Problem",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-88",
    "pattern": "Binary Search",
    "title": "Split largest arrray",
    "links": [
      {
        "url": "https://leetcode.com/problems/split-array-largest-sum/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-89",
    "pattern": "Binary Search",
    "title": "Search 2 D matrix",
    "links": [
      {
        "url": "https://leetcode.com/problems/search-a-2d-matrix/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-90",
    "pattern": "Binary Search",
    "title": "Search 2D matrix",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/search-a-2d-matrix-ii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-91",
    "pattern": "Binary Search",
    "title": "kth smallest in sorted matrix",
    "links": [
      {
        "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-92",
    "pattern": "Binary Search",
    "title": "kth smallest in multiplication matrix",
    "links": [
      {
        "url": "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-93",
    "pattern": "Binary Search",
    "title": "median of 2 sorted arrays",
    "links": [
      {
        "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-94",
    "pattern": "Heap Pattern",
    "subCategory": "Kth",
    "title": "kth smallest",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-95",
    "pattern": "Heap Pattern",
    "subCategory": "Kth",
    "title": "kth largest",
    "links": [
      {
        "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-96",
    "pattern": "Heap Pattern",
    "subCategory": "Kth",
    "title": "TOP K frequent Elements",
    "links": [
      {
        "url": "https://leetcode.com/problems/top-k-frequent-elements/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-97",
    "pattern": "Heap Pattern",
    "subCategory": "Kth",
    "title": "Top K frequent Words",
    "links": [
      {
        "url": "https://leetcode.com/problems/top-k-frequent-words/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-98",
    "pattern": "Heap Pattern",
    "subCategory": "K closest",
    "title": "K closest points to origin",
    "links": [
      {
        "url": "https://leetcode.com/problems/k-closest-points-to-origin/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-99",
    "pattern": "Heap Pattern",
    "subCategory": "K closest",
    "title": "Find K closest elements",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-k-closest-elements/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-100",
    "pattern": "Heap Pattern",
    "subCategory": "K closest",
    "title": "Kth weakest row in Matrix",
    "links": [
      {
        "url": "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-101",
    "pattern": "Heap Pattern",
    "subCategory": "heap as pointer",
    "title": "Merge K Sorted Arrays",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-102",
    "pattern": "Heap Pattern",
    "subCategory": "heap as pointer",
    "title": "Kth Smallest in Sorted Matrix",
    "links": [
      {
        "url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-103",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "LAST STONE WEIGHT",
    "links": [
      {
        "url": "https://leetcode.com/problems/last-stone-weight/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-104",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "CPU Task Scheduler",
    "links": [
      {
        "url": "https://leetcode.com/problems/task-scheduler/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-105",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "Reorganize String",
    "links": [
      {
        "url": "https://leetcode.com/problems/reorganize-string/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-106",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "Min number of refueling stops",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-number-of-refueling-stops/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-107",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "IPO",
    "links": [
      {
        "url": "https://leetcode.com/problems/ipo/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-108",
    "pattern": "Heap Pattern",
    "subCategory": "GREEDY+heap",
    "title": "Course Scheduler 3",
    "links": [
      {
        "url": "https://leetcode.com/problems/course-schedule-iii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-109",
    "pattern": "Heap Pattern",
    "subCategory": "2 heaps",
    "title": "Find median in data stream",
    "links": [
      {
        "url": "https://leetcode.com/problems/find-median-from-data-stream/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-110",
    "pattern": "Heap Pattern",
    "subCategory": "2 heaps",
    "title": "Sliding Window Median",
    "difficulty": "Hard",
    "links": [
      {
        "url": "https://leetcode.com/problems/sliding-window-median/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-111",
    "pattern": "Recursion & Backtracking",
    "title": "Fibonnaci",
    "links": [
      {
        "url": "https://leetcode.com/problems/fibonacci-number/description/",
        "platform": "leetcode",
        "label": "LeetCode (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=j4wjZqzhMqc&t",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-112",
    "pattern": "Recursion & Backtracking",
    "title": "Check if string is Pallindrome",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/palindrome-string0817/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=j4wjZqzhMqc&t",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-113",
    "pattern": "Recursion & Backtracking",
    "title": "Check if Array is Sorted",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-114",
    "pattern": "Recursion & Backtracking",
    "title": "Sum of digits of a number",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-115",
    "pattern": "Recursion & Backtracking",
    "title": "Remove occurences of a character in string",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=-gC-QEdpvO4",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-116",
    "pattern": "Recursion & Backtracking",
    "title": "Generate parenthesis",
    "links": [
      {
        "url": "https://leetcode.com/problems/generate-parentheses/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-117",
    "pattern": "Recursion & Backtracking",
    "title": "Letter Combinations of phone number",
    "links": [
      {
        "url": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/",
        "platform": "leetcode",
        "label": "LeetCode (1)"
      },
      {
        "url": "https://www.youtube.com/watch?v=IKfIT6uFOcs",
        "platform": "youtube",
        "label": "Video Solution (2)"
      }
    ]
  },
  {
    "id": "prob-118",
    "pattern": "Recursion & Backtracking",
    "title": "Permutations",
    "links": [
      {
        "url": "https://leetcode.com/problems/permutations/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-119",
    "pattern": "Recursion & Backtracking",
    "title": "Combination Sum",
    "links": [
      {
        "url": "https://leetcode.com/problems/combination-sum/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-120",
    "pattern": "Recursion & Backtracking",
    "title": "Pallindrome partition",
    "links": [
      {
        "url": "https://leetcode.com/problems/palindrome-partitioning/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-121",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "Inorder",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-inorder-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-122",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "Preorder",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-preorder-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-123",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "Postorder",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-postorder-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-124",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "Level Order",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-125",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "ZigZag Order",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-126",
    "pattern": "Tree Pattern",
    "subCategory": "Traversal",
    "title": "Level Order II",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-127",
    "pattern": "Tree Pattern",
    "subCategory": "Mirror and Symmetry",
    "title": "Invert Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/invert-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-128",
    "pattern": "Tree Pattern",
    "subCategory": "Mirror and Symmetry",
    "title": "Symmetric Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/symmetric-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-129",
    "pattern": "Tree Pattern",
    "subCategory": "Mirror and Symmetry",
    "title": "Same Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/same-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-130",
    "pattern": "Tree Pattern",
    "subCategory": "Mirror and Symmetry",
    "title": "Subtree of another TREE",
    "links": [
      {
        "url": "https://leetcode.com/problems/subtree-of-another-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-131",
    "pattern": "Tree Pattern",
    "subCategory": "Mirror and Symmetry",
    "title": "Flip Equivalent Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/flip-equivalent-binary-trees/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-132",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "LCA of Binary TREE",
    "links": [
      {
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-133",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "Binary Search Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-134",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "LCA of BST",
    "links": [
      {
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-135",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "LCA of Deepest Leaves",
    "links": [
      {
        "url": "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-136",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "Two Sum IV",
    "links": [
      {
        "url": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-137",
    "pattern": "Tree Pattern",
    "subCategory": "Search",
    "title": "Kth smallest element in BST",
    "links": [
      {
        "url": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-138",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Minimum Depth of Binary Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-depth-of-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-139",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Maximum Depth of Binary Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-140",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Balanced Binary Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/balanced-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-141",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Diameter of Binary Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/diameter-of-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-142",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Check Completeness of Binary Tree",
    "links": [
      {
        "url": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-143",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Validate BST",
    "links": [
      {
        "url": "https://leetcode.com/problems/validate-binary-search-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-144",
    "pattern": "Tree Pattern",
    "subCategory": "Validation",
    "title": "Recover BST",
    "links": [
      {
        "url": "https://leetcode.com/problems/recover-binary-search-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-145",
    "pattern": "Tree Pattern",
    "subCategory": "Path SUM",
    "title": "Path Sum",
    "links": [
      {
        "url": "https://leetcode.com/problems/path-sum/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-146",
    "pattern": "Tree Pattern",
    "subCategory": "Path SUM",
    "title": "Path Sum II",
    "links": [
      {
        "url": "https://leetcode.com/problems/path-sum-ii/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-147",
    "pattern": "Tree Pattern",
    "subCategory": "Path SUM",
    "title": "Sum of Root to Leaf",
    "links": [
      {
        "url": "https://leetcode.com/problems/sum-root-to-leaf-numbers/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-148",
    "pattern": "Tree Pattern",
    "subCategory": "Path SUM",
    "title": "Maximum Path Sum",
    "links": [
      {
        "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-149",
    "pattern": "Tree Pattern",
    "subCategory": "Construction",
    "title": "Contruct tree from preorder and inorder",
    "links": [
      {
        "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-150",
    "pattern": "Tree Pattern",
    "subCategory": "Construction",
    "title": "Contruct tree from postorder and inorder",
    "links": [
      {
        "url": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-151",
    "pattern": "Tree Pattern",
    "subCategory": "Construction",
    "title": "Sorted Array to BST",
    "links": [
      {
        "url": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-152",
    "pattern": "Graphs",
    "title": "Construct Adjancency List from EDGES+Nodes",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-153",
    "pattern": "Graphs",
    "title": "Graph DFS",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-154",
    "pattern": "Graphs",
    "title": "GRAPH BFS",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-155",
    "pattern": "Graphs",
    "title": "Number of Islands",
    "links": [
      {
        "url": "https://leetcode.com/problems/number-of-islands/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-156",
    "pattern": "Graphs",
    "title": "Number of Provinces",
    "links": [
      {
        "url": "https://leetcode.com/problems/number-of-provinces/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-157",
    "pattern": "Graphs",
    "title": "Rotten Oranges",
    "links": [
      {
        "url": "https://leetcode.com/problems/rotting-oranges/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-158",
    "pattern": "Graphs",
    "title": "Cycle detection in undirected graph",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-159",
    "pattern": "Graphs",
    "title": "Cycle detection in directed graph",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-160",
    "pattern": "Graphs",
    "title": "Topological sort",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/topological-sort/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-161",
    "pattern": "Graphs",
    "title": "Bipartite Graph/ Graph Coloring",
    "links": [
      {
        "url": "https://leetcode.com/problems/is-graph-bipartite/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-162",
    "pattern": "Graphs",
    "title": "Surrounded Regoins",
    "links": [
      {
        "url": "https://leetcode.com/problems/surrounded-regions/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-163",
    "pattern": "Graphs",
    "title": "Shortest Path in Non-Weighted Graph",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-164",
    "pattern": "Graphs",
    "title": "Dijkstra's Algorithm",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-165",
    "pattern": "Graphs",
    "title": "Network Delay",
    "links": [
      {
        "url": "https://leetcode.com/problems/network-delay-time/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-166",
    "pattern": "Graphs",
    "title": "Path With Minimum Effort",
    "links": [
      {
        "url": "https://leetcode.com/problems/path-with-minimum-effort/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-167",
    "pattern": "Graphs",
    "title": "Swim in Rising Water",
    "links": [
      {
        "url": "https://leetcode.com/problems/swim-in-rising-water/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-168",
    "pattern": "Graphs",
    "title": "Bellman ford",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-169",
    "pattern": "Graphs",
    "title": "Cheapest Path in K stops",
    "links": [
      {
        "url": "https://leetcode.com/problems/cheapest-flights-within-k-stops/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-170",
    "pattern": "Graphs",
    "title": "Prim MST",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-171",
    "pattern": "Graphs",
    "title": "Word Ladder",
    "links": [
      {
        "url": "https://leetcode.com/problems/word-ladder/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-172",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode-02: Fibonacci",
    "links": [
      {
        "url": "https://leetcode.com/problems/fibonacci-number/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-173",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 03: Climbing Stairs",
    "links": [
      {
        "url": "https://leetcode.com/problems/climbing-stairs/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-174",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 04: House Robber",
    "links": [
      {
        "url": "https://leetcode.com/problems/house-robber/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-175",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 05: 0/1 Knapsack",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-176",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 06: tabulation Intro",
    "links": [
      {
        "url": "https://leetcode.com/problems/climbing-stairs/description/",
        "platform": "leetcode",
        "label": "LeetCode (Tabulation)"
      }
    ]
  },
  {
    "id": "prob-177",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 07: 0/1 Knapsack Tabulation",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-178",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 08: Subset sum",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-179",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 09 : Target Sum",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/target-sum-1626326450/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  },
  {
    "id": "prob-180",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 10 : LIS",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-181",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 11 : LIS Tabulation",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-increasing-subsequence/description/",
        "platform": "leetcode",
        "label": "LeetCode (LIS Tabulation)"
      }
    ]
  },
  {
    "id": "prob-182",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 12 : LCS",
    "links": [
      {
        "url": "https://leetcode.com/problems/longest-common-subsequence/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-183",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 13 : Unique Paths",
    "links": [
      {
        "url": "https://leetcode.com/problems/unique-paths/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-184",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 14: Buy Sell Stocks",
    "links": [
      {
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-185",
    "pattern": "Dynamic Programming (DP)",
    "title": "Best Time To Buy And Sell Stock Ii",
    "links": [
      {
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-186",
    "pattern": "Dynamic Programming (DP)",
    "title": "Best Time To Buy And Sell Stock Iii",
    "links": [
      {
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-187",
    "pattern": "Dynamic Programming (DP)",
    "title": "Best Time To Buy And Sell Stock Iv",
    "links": [
      {
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-188",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 15: MIn cost to cut stick",
    "links": [
      {
        "url": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-189",
    "pattern": "Dynamic Programming (DP)",
    "title": "Episode 16: Revision",
    "links": [
      {
        "url": "https://leetcode.com/problems/coin-change/description/",
        "platform": "leetcode",
        "label": "LeetCode (DP Revision)"
      }
    ]
  },
  {
    "id": "prob-190",
    "pattern": "Greedy",
    "title": "Lemonade",
    "links": [
      {
        "url": "https://leetcode.com/problems/lemonade-change/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-191",
    "pattern": "Greedy",
    "title": "Jump Game",
    "links": [
      {
        "url": "https://leetcode.com/problems/jump-game/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-192",
    "pattern": "Greedy",
    "title": "Assign cookies",
    "links": [
      {
        "url": "https://leetcode.com/problems/assign-cookies/description/",
        "platform": "leetcode",
        "label": "LeetCode"
      }
    ]
  },
  {
    "id": "prob-193",
    "pattern": "Greedy",
    "title": "Fractional Knapsack",
    "links": [
      {
        "url": "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1",
        "platform": "geeksforgeeks",
        "label": "GeeksforGeeks"
      }
    ]
  }
];

export function searchPracticeProblems(query: string): {
  matchedPatterns: PatternGroup[];
  matchedProblems: PracticeProblem[];
  totalMatches: number;
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      matchedPatterns: DSA_PATTERNS,
      matchedProblems: ALL_PRACTICE_PROBLEMS,
      totalMatches: ALL_PRACTICE_PROBLEMS.length,
    };
  }

  // Common aliases
  const normalizedQuery = q === "dp" ? "dynamic programming" : q;

  // 1. Direct Pattern Match
  const patternMatches = DSA_PATTERNS.filter(p =>
    p.name.toLowerCase().includes(normalizedQuery) ||
    normalizedQuery.includes(p.name.toLowerCase()) ||
    p.description.toLowerCase().includes(normalizedQuery)
  );

  // 2. Problem level search (matches title, pattern, subcategory, difficulty)
  const problemMatches = ALL_PRACTICE_PROBLEMS.filter(prob => {
    const titleMatch = prob.title.toLowerCase().includes(normalizedQuery);
    const patternMatch = prob.pattern.toLowerCase().includes(normalizedQuery);
    const subMatch = prob.subCategory ? prob.subCategory.toLowerCase().includes(normalizedQuery) : false;
    const diffMatch = prob.difficulty ? prob.difficulty.toLowerCase() === normalizedQuery : false;
    return titleMatch || patternMatch || subMatch || diffMatch;
  });

  // Group matched problems by pattern
  const matchedPatternIds = new Set<string>();
  for (const prob of problemMatches) {
    const pat = DSA_PATTERNS.find(p => p.name === prob.pattern);
    if (pat) matchedPatternIds.add(pat.id);
  }
  for (const pat of patternMatches) {
    matchedPatternIds.add(pat.id);
  }

  const resultPatterns: PatternGroup[] = [];
  for (const pat of DSA_PATTERNS) {
    if (matchedPatternIds.has(pat.id)) {
      const matchingInGroup = pat.problems.filter(prob =>
        problemMatches.some(m => m.id === prob.id) ||
        pat.name.toLowerCase().includes(normalizedQuery)
      );
      if (matchingInGroup.length > 0) {
        resultPatterns.push({
          ...pat,
          problemCount: matchingInGroup.length,
          problems: matchingInGroup,
        });
      }
    }
  }

  return {
    matchedPatterns: resultPatterns,
    matchedProblems: problemMatches,
    totalMatches: problemMatches.length,
  };
}
