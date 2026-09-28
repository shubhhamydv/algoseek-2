import json
import os

uploads_path = "data/user_uploads.json"
if os.path.exists(uploads_path):
    with open(uploads_path, "r", encoding="utf-8") as f:
        data = json.load(f)
else:
    data = {"documents": [], "chunks": []}

existing_docs = {d.get("title"): d for d in data.get("documents", [])}

curated_pdfs = [
    {
        "docId": "lib-striver-patterns",
        "title": "How to Recognize Which Data Structure to Use (Striver)",
        "sourceType": "pdf",
        "fileName": "striver-dsa-pattern-recognition-cheatsheet.pdf",
        "text": "Striver Pattern Recognition Guide. Two Pointers vs Sliding Window: Two pointers is used when array is sorted or for summation problems like two sum and three sum. Sliding window is for contiguous subarrays or substrings with frequency hashing. Hashing is used when storing frequency or recalling past elements during traversal. Binary Search is used for min or max on answers with monotonic increasing or decreasing search spaces. Monotonic stack for next greater element and next smaller element. Recursion and backtracking for all possible ways, pick and not pick subproblems, N-Queens, and Sudoku. Graphs use multi-source BFS for simultaneous infection or shortest path. Dynamic programming covers 1D and 2D state transitions.",
    },
    {
        "docId": "lib-ds-master-notes",
        "title": "Data Structures Master Handwritten Notes (176 Pages)",
        "sourceType": "pdf",
        "fileName": "data-structures-handwritten-master-notes-176p.pdf",
        "text": "Master Handwritten Lecture Notes on Data Structures in C. Topics: Dynamic memory allocation with malloc, calloc, realloc, and free. Single linked list, doubly linked list, circular linked list with node insertion, deletion, and reversal algorithms. Stack applications: infix to postfix conversion, prefix evaluation, and parentheses balancing. Queue implementations: linear queue, circular queue, double-ended deque, and priority queue with array and linked list models. Sorting algorithms: Bubble, selection, insertion, merge, quick, shell, and radix sort. Tree structures: Binary tree, strictly binary, complete binary tree, Binary Search Tree (BST), and AVL tree self-balancing rotations (LL, RR, LR, RL). Graph representations, Breadth-First Search (BFS), Depth-First Search (DFS), and open addressing hashing.",
    },
    {
        "docId": "lib-raghav-sir-notes",
        "title": "The Problem Book of Life & Death (Raghav Sir · MNNIT)",
        "sourceType": "pdf",
        "fileName": "raghav-sir-data-structures-notes.pdf",
        "text": "The Problem Book of Life and Death: Data Structures by Raghav Sir, compiled by Uphar Goyal (MNNIT Allahabad). Covers 7 chapters: Chapter 1 Arrays (Kth smallest element with min/max heap, right rotation in-place, pairs sum, Kadane largest subarray sum, median of two sorted arrays, binary search in rotated array in O(log n), repeating elements in O(n)). Chapter 2 Linked Lists (Sorted insert, nth insertion, insert sort, front-back split, remove duplicates, alternate split, shuffle merge, sorted merge, reverse linked list with one/two pointers and recursion). Chapter 3 Sorting (Randomized quicksort, 3-way partition, iterative mergesort). Chapter 4 Strings (Length without strlen, inplace reversal, anagram checking with hashing). Chapter 5 Stacks & Queues (Min stack in O(1), queue using two stacks). Chapter 6 Trees (Inorder successor, tree traversal with parent pointer, balanced tree check, closest common ancestor, binary tree to BST conversion, double tree). Chapter 7 Miscellaneous (Sum of digits, power of 2, 8 queens backtracking, Josephus problem, maze solving).",
    },
    {
        "docId": "lib-seinfeld-bookey",
        "title": "Is This Anything? (Jerry Seinfeld · Bookey)",
        "sourceType": "pdf",
        "fileName": "is-this-anything-jerry-seinfeld-bookey.pdf",
        "text": "Is This Anything? Decades of Laughter: Seinfeld Comedy Masterpieces Unveiled by Bookey based on Jerry Seinfeld 45-year archive. 42 chapter summaries and analyses: Cotton Balls and gendered grooming rituals, Dogs in Cars and animal perception of speed, Superman TV Show plot inconsistencies and Clark Kent disguise, Gym Class uniforms and rope climbing, Mom Walls and childhood boredom vs adulthood patience, Prisoners of Inertia in professional wrestling, Friendly Pilot Chit Chat, Airport X-Ray security, Halloween candy, Milk expiration anxiety, Post Office Annoyance, Movie plots and subtitles, NYC Cabs, Phone machines as relationship respirators, Pet Monkeys, Checks vs Cash, Tone in marriage, Pop-Tarts as revolutionary food tech, Buffet dynamics, Raisin marketing, Uber travel paradigms, and Flex Seal infomercials.",
    },
    {
        "docId": "lib-google-sde-sheet",
        "title": "Google SDE Sheet — 457 Tagged LeetCode Questions",
        "sourceType": "pdf",
        "fileName": "google-sde-sheet-457.pdf",
        "text": "Google Tagged Problems from LeetCode (SDE Sheet for Google) compiled by Saheb Kumar. 457 questions asked in Google interviews over the last 6 months arranged in ascending order of acceptance rate from Easy to Hard. Covers Two Sum, Median of Two Sorted Arrays, Word Break, Trapping Rain Water, Course Schedule, Number of Islands, LRU Cache, Sliding Window Maximum, Alien Dictionary, Robot Room Cleaner, Serialize and Deserialize Binary Tree, Edit Distance, and N-Queens.",
    },
    {
        "docId": "lib-apna-college-375",
        "title": "Apna College DSA Master Sheet — 375 Questions",
        "sourceType": "pdf",
        "fileName": "apna-college-dsa-375-sheet.pdf",
        "text": "DSA Master Sheet by Shradha Didi and Aman Bhaiya (Apna College). 375 problems categorized across 16 topics with target company tags (Google, Microsoft, Amazon, Adobe, Flipkart, Samsung) and recommended solving times (5-10m Easy, 15-20m Medium, 40-60m Hard). Topics include Arrays (Kadane algorithm, chocolate distribution), Strings (KMP, Rabin-Karp), 2D Arrays, Searching and Sorting, Backtracking, Linked Lists, Stacks & Queues, Greedy, Binary Trees, BSTs, Heaps & Hashing, Graphs, Tries, Dynamic Programming, Bit Manipulation, and Segment Trees.",
    },
    {
        "docId": "lib-java-cheatsheet",
        "title": "Java Language & Syntax Cheatsheet",
        "sourceType": "pdf",
        "fileName": "java-programming-cheatsheet.pdf",
        "text": "Java Quick Reference Cheatsheet. Basics: Boilerplate public static void main, Scanner I/O, output formatting with System.out.printf. 8 primitive types: byte, short, int, long, float, double, boolean, char. Widening and narrowing type casting. Control flow: if/else, ternary operator, switch expressions. Loops: while, do-while, for, and enhanced for-each loop. Arrays and multi-dimensional matrices. Methods, method overloading, and recursion. String class methods: length, toUpperCase, indexOf, substring, replace, and equals. Math class utilities: Math.max, Math.min, Math.sqrt, Math.pow, Math.abs, Math.random.",
    },
    {
        "docId": "lib-js-cheatsheet",
        "title": "JavaScript & Modern ES6+ Cheatsheet",
        "sourceType": "pdf",
        "fileName": "javascript-core-cheatsheet.pdf",
        "text": "JavaScript Modern ES6+ Cheatsheet. Adding scripts: inline, external, defer, type module. Variables: let, const block scoping. Functions: declarations, arrow functions, default parameters. DOM manipulation: querySelector, querySelectorAll, getElementById, textContent, createElement, appendChild. Control flow and loops: for, for-of, forEach, while, do-while. Strings and Array methods: push, pop, shift, unshift, includes, find, filter, map, reduce. Numbers and Math. Dates with Date object. Event listeners (click, input, keydown, submit). Error handling with try catch finally. Async JavaScript with Promises and async await fetch. Modern ES6+ features: destructuring, spread and rest operators, ES modules import export, and DevTools debugger.",
    },
    {
        "docId": "lib-mongo-cheatsheet",
        "title": "MongoDB Database & Aggregation Cheatsheet",
        "sourceType": "pdf",
        "fileName": "mongodb-database-cheatsheet.pdf",
        "text": "MongoDB Command Cheatsheet for v4.2 to v7.x. Database commands: show dbs, use dbName, db.dropDatabase. Collection commands: show collections, createCollection, drop. Document CRUD: insertOne, insertMany, find, findOne, pretty, countDocuments. Update commands: updateOne, updateMany, $set, $inc, $rename, upsert. Delete commands: deleteOne, deleteMany. Query operators: comparison $lt, $lte, $gt, $gte, $ne; logical $and, $or, $in, $nin. Sorting with sort and pagination with skip and limit. Indexes: createIndex, getIndexes, dropIndex. Aggregation pipeline: aggregate with $group, $sum, and $avg.",
    },
    {
        "docId": "lib-applications-ds",
        "title": "Applications of Data Structures in Real Life",
        "sourceType": "pdf",
        "fileName": "applications-of-data-structures-in-real-life.pdf",
        "text": "Real-Life Production Applications of Data Structures by Aakash Kanojiya. Arrays: 2D arrays in image processing matrix representations, Sudoku and chessboards, online ticketing systems, cell phone contacts. Linked Lists: Music players next/previous buttons using doubly and circular linked lists, escalators, train coach coupling, social media feeds, Tinder swipe gesture stacks. Stacks: Undo/redo operations in word processors, dinner plate piles, browser history navigation. Queues: Printer spoolers, email dispatching, car washes, web server request processing, OS process scheduling. Graphs: Social networking friend suggestion algorithms, React virtual DOM reconciliation, Microsoft Excel DAG dependency trees, airline flight routes. Trees: Database B-Tree indexing, DNS domain name servers, mobile file systems, HTML DOM tree, Quora comment hierarchies. Sorting: Hybrid IntroSort in C++ STL sort, database merge sort.",
    },
    {
        "docId": "lib-beginners-sheet",
        "title": "Beginners Coding Sheet — 65 Core Fundamentals",
        "sourceType": "pdf",
        "fileName": "beginners-coding-sheet-siddharth-singh.pdf",
        "text": "Beginners Coding Sheet by Siddharth Singh. 65 foundational programming questions across 7 modules: Basic (8 questions: Hello World, user I/O, integer division quotient and remainder, sizeof data types, swap numbers, ASCII value, float multiplication). If-Else (5 questions: even/odd, vowel/consonant, largest of three, quadratic equation roots, leap year). Loops (16 questions: sum of N natural numbers, factorial, multiplication table, Fibonacci series, GCD/HCF, LCM, reverse number, palindrome, prime checking, prime intervals, Armstrong number, factors). Switch & Patterns (10 questions: calculator, solid and hollow rectangle, half pyramid, inverted pyramid, Pascal triangle). Functions & Recursion (8 questions: primes sum, binary to decimal, recursion factorial, GCD, power). Arrays (8 questions: average, largest element, standard deviation, pointers, matrix addition, matrix multiplication, transpose, cyclic swap). Strings (10 questions: frequency, remove non-alphabets, length, concatenation, case change, palindrome, word count, capitalize, largest word).",
    },
    {
        "docId": "lib-youtube-resources",
        "title": "All Important Links to Learn Programming on YouTube",
        "sourceType": "pdf",
        "fileName": "youtube-programming-resources-dsa-dev.pdf",
        "text": "Curated YouTube Resources for Programming, DSA, and Web Development by Himanshu Shekhar. Topic-wise YouTube playlists for DSA: Arrays, Strings, Dynamic Programming, Recursion, Heaps, Sliding Window, Binary Search, Stacks, Hashing, Binary Trees, Graphs, Tries, Segment Trees, and Competitive Programming. Top YouTube Channels for DSA: Apna College, Aditya Verma, Abdul Bari, Nick White, Tech Dose, Keerthi Purswani, takeUforward (Striver), CodeWithHarry, Code Library, Pepcoding. Web development roadmap: HTML, CSS, JavaScript, React, Node, Express, MongoDB. Full-stack project blueprints: Amazon clone, Netflix clone, weather search, real-time chat app, ecommerce website. Standout DSA resume projects: TinyURL with hash functions, Sudoku solver backtracking, Huffman greedy file zipper, map navigator shortest path, React-like framework with BFS/DFS, sorting visualizer.",
    },
    {
        "docId": "lib-dsa-170-sheet",
        "title": "170 Questions Core DSA Problem Sheet",
        "sourceType": "pdf",
        "fileName": "dsa-170-problem-sheet.pdf",
        "text": "170 Questions Core DSA Problem Sheet with topic-wise breakdown and direct LeetCode and GeeksforGeeks links. Arrays (Two Sum, Best Time to Buy and Sell Stock, Two Sum II, Contains Duplicate, Kadane Maximum Subarray, 3Sum, Container With Most Water, Subarray Sum Equals K, Longest Subarray with Sum K, Merge Intervals, Find Duplicate, Pascal Triangle, Rotate Matrix, Next Permutation, Inversion of Array, Trapping Rain Water). Binary Search, Strings (Longest Palindromic Substring, Anagrams, Minimum Window Substring), Greedy, Recursion, Dynamic Programming (House Robber, LCS, Coin Change, Knapsack), Trees, Binary Search Trees, Graphs, Linked Lists, Stacks & Queues, and Heaps.",
    },
]

added = 0
for item in curated_pdfs:
    if item["title"] not in existing_docs:
        data.setdefault("documents", []).append({
            "docId": item["docId"],
            "sourceId": item["docId"],
            "sourceType": "pdf",
            "title": item["title"],
            "status": "complete",
            "chunks": 1,
        })
        data.setdefault("chunks", []).append({
            "docId": item["docId"],
            "sourceType": "pdf",
            "sourceId": item["docId"],
            "title": item["title"],
            "text": item["text"],
            "chunkIndex": 0,
            "page": 1,
            "timestamp": None,
        })
        added += 1

with open(uploads_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

os.makedirs("dist/data", exist_ok=True)
with open("dist/data/user_uploads.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Added {added} curated PDF documents. Total documents: {len(data['documents'])}")
