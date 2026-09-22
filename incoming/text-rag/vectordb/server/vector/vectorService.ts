import { countVectorItems, deleteVectorItem, insertVectorItem, listVectorItems } from "../db";
import { BruteForceIndex, KDTreeIndex } from "./exact";
import { DEMO_VECTORS } from "./demoData";
import { HNSWIndex } from "./hnsw";
import { getDistance } from "./metrics";
import type { DistanceMetric, SearchAlgorithm, VectorItem } from "./types";

export class VectorService {
  private items: VectorItem[] = [];
  private readonly brute = new BruteForceIndex();
  private readonly kd = new KDTreeIndex(16);
  private readonly hnsw = new HNSWIndex(16, 200);
  private ready = false;
  private initPromise: Promise<void> | null = null;

  async ensureReady() {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const persisted = await listVectorItems();
      if (!persisted.length && !(await countVectorItems())) {
        for (const item of DEMO_VECTORS) {
          const id = await insertVectorItem({ metadata: item.metadata, category: item.category, embedding: item.embedding });
          persisted.push({ ...item, id: id ?? item.id });
        }
      }
      this.items = persisted;
      this.rebuildIndexes();
      this.ready = true;
    })();
    try { await this.initPromise; } finally { this.initPromise = null; }
  }

  private rebuildIndexes() {
    this.brute.items = [];
    this.kd.rebuild(this.items);
    for (const item of this.items) { this.brute.insert(item); this.hnsw.insert(item, getDistance("cosine")); }
  }

  async all() { await this.ensureReady(); return this.items; }
  async size() { await this.ensureReady(); return this.items.length; }

  async insert(metadata: string, category: string, embedding: number[]) {
    await this.ensureReady();
    const id = await insertVectorItem({ metadata, category, embedding });
    const item = { id: id ?? Math.max(0, ...this.items.map(v => v.id)) + 1, metadata, category, embedding };
    this.items.push(item); this.brute.insert(item); this.kd.insert(item); this.hnsw.insert(item, getDistance("cosine"));
    return item;
  }

  async remove(id: number) {
    await this.ensureReady();
    const existed = this.items.some(item => item.id === id);
    if (!existed) return false;
    await deleteVectorItem(id);
    this.items = this.items.filter(item => item.id !== id);
    this.brute.remove(id); this.hnsw.remove(id); this.kd.rebuild(this.items);
    return true;
  }

  async search(query: number[], k: number, metric: DistanceMetric, algo: SearchAlgorithm) {
    await this.ensureReady();
    const distance = getDistance(metric);
    const started = performance.now();
    const raw = algo === "bruteforce" ? this.brute.knn(query, k, distance) : algo === "kdtree" ? this.kd.knn(query, k, distance) : this.hnsw.knn(query, k, 50, distance);
    const latencyUs = Math.round((performance.now() - started) * 1000);
    return { results: raw.map(hit => ({ ...this.items.find(item => item.id === hit.id)!, distance: hit.distance })), latencyUs, algo, metric };
  }

  async benchmark(query: number[], k: number, metric: DistanceMetric) {
    await this.ensureReady();
    const distance = getDistance(metric);
    const measure = (fn: () => unknown) => { const started = performance.now(); fn(); return Math.round((performance.now() - started) * 1000); };
    return { bruteforceUs: measure(() => this.brute.knn(query, k, distance)), kdtreeUs: measure(() => this.kd.knn(query, k, distance)), hnswUs: measure(() => this.hnsw.knn(query, k, 50, distance)), itemCount: this.items.length };
  }

  async graphInfo() { await this.ensureReady(); return this.hnsw.getInfo(); }
  async stats() { await this.ensureReady(); return { count: this.items.length, dims: 16, algorithms: ["bruteforce", "kdtree", "hnsw"], metrics: ["euclidean", "cosine", "manhattan"] as const }; }
}

export const vectorService = new VectorService();
