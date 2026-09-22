import { describe, expect, it } from "vitest";
import { chunkText } from "./ai/documentService";
import { cosine, euclidean, manhattan } from "./vector/metrics";
import { BruteForceIndex, KDTreeIndex } from "./vector/exact";
import { HNSWIndex } from "./vector/hnsw";
import { DEMO_VECTORS } from "./vector/demoData";

const distance = cosine;

describe("VectorDB parity algorithms", () => {
  it("preserves the three distance metrics", () => {
    expect(euclidean([3, 4], [0, 0])).toBe(5);
    expect(manhattan([3, -4], [0, 0])).toBe(7);
    expect(cosine([1, 0], [1, 0])).toBeCloseTo(0);
    expect(cosine([0, 0], [1, 0])).toBe(1);
  });

  it("returns the same nearest demo categories across indexes", () => {
    const brute = new BruteForceIndex(); const kd = new KDTreeIndex(16); const hnsw = new HNSWIndex(16, 200);
    for (const item of DEMO_VECTORS) { brute.insert(item); kd.insert(item); hnsw.insert(item, distance); }
    const query = DEMO_VECTORS[1].embedding;
    expect(brute.knn(query, 3, distance).map(x => x.id)).toEqual([2, 5, 4]);
    expect(kd.knn(query, 3, distance).map(x => x.id)).toEqual([2, 5, 4]);
    expect(hnsw.knn(query, 3, 50, distance)[0].id).toBe(2);
  });

  it("repeats the same seeded HNSW layer shape", () => {
    const a = new HNSWIndex(16, 200); const b = new HNSWIndex(16, 200);
    for (const item of DEMO_VECTORS) { a.insert(item, distance); b.insert(item, distance); }
    expect(a.getInfo().nodesPerLayer).toEqual(b.getInfo().nodesPerLayer);
    expect(a.getInfo().edgesPerLayer).toEqual(b.getInfo().edgesPerLayer);
  });

  it("rebuilds exact indexes and removes HNSW neighbors", () => {
    const kd = new KDTreeIndex(2); const hnsw = new HNSWIndex(4, 20);
    const items = [{ id: 1, metadata: "a", category: "x", embedding: [0, 0] }, { id: 2, metadata: "b", category: "x", embedding: [1, 1] }, { id: 3, metadata: "c", category: "x", embedding: [5, 5] }];
    kd.rebuild(items); hnsw.insert(items[0], euclidean); hnsw.insert(items[1], euclidean); hnsw.insert(items[2], euclidean); hnsw.remove(2);
    expect(kd.knn([0, 0], 2, euclidean).map(x => x.id)).toEqual([1, 2]);
    expect(hnsw.getInfo().nodes.some(x => x.id === 2)).toBe(false);
  });

  it("chunks at 250 words with 30 words overlap", () => {
    const words = Array.from({ length: 480 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkText(words);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].split(" ")).toHaveLength(250);
    expect(chunks[1].split(" ")).toHaveLength(250);
    expect(chunks[2].split(" ")).toHaveLength(40);
    expect(chunks[1].split(" ").slice(0, 30)).toEqual(chunks[0].split(" ").slice(-30));
  });
});
