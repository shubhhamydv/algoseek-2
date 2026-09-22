import type { DistanceFn, GraphInfo, ScoredId, VectorItem } from "./types";

class SeededRng {
  private readonly state = new Uint32Array(624);
  private index = 624;
  constructor(seed = 42) { this.state[0] = seed >>> 0; for (let i = 1; i < 624; i += 1) this.state[i] = (1812433253 * (this.state[i - 1] ^ (this.state[i - 1] >>> 30)) + i) >>> 0; }
  private twist() { for (let i = 0; i < 624; i += 1) { const y = (this.state[i] & 0x80000000) + (this.state[(i + 1) % 624] & 0x7fffffff); this.state[i] = this.state[(i + 397) % 624] ^ (y >>> 1); if (y & 1) this.state[i] ^= 0x9908b0df; } this.index = 0; }
  next() { if (this.index >= 624) this.twist(); let y = this.state[this.index++]; y ^= y >>> 11; y ^= (y << 7) & 0x9d2c5680; y ^= (y << 15) & 0xefc60000; y ^= y >>> 18; return ((y >>> 8) + 0.5) / 16777216; }
}

type Node = { item: VectorItem; maxLyr: number; nbrs: number[][] };

export class HNSWIndex {
  private readonly graph = new Map<number, Node>();
  private readonly rng = new SeededRng();
  private topLayer = -1;
  private entryPoint = -1;
  private readonly mL: number;

  constructor(private readonly M = 16, private readonly efBuild = 200) {
    this.mL = 1 / Math.log(M);
  }

  private randomLevel() {
    const u = Math.max(this.rng.next(), Number.EPSILON);
    return Math.floor(-Math.log(u) * this.mL);
  }

  private searchLayer(query: number[], entry: number, ef: number, layer: number, distance: DistanceFn): ScoredId[] {
    const start = this.graph.get(entry);
    if (!start) return [];
    const visited = new Set<number>([entry]);
    const candidates: ScoredId[] = [{ distance: distance(query, start.item.embedding), id: entry }];
    const found: ScoredId[] = [...candidates];
    while (candidates.length) {
      candidates.sort((a, b) => a.distance - b.distance || a.id - b.id);
      const current = candidates.shift()!;
      found.sort((a, b) => b.distance - a.distance || b.id - a.id);
      if (found.length >= ef && current.distance > found[0].distance) break;
      const node = this.graph.get(current.id);
      for (const neighborId of node?.nbrs[layer] ?? []) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        const neighbor = this.graph.get(neighborId);
        if (!neighbor) continue;
        const hit = { distance: distance(query, neighbor.item.embedding), id: neighborId };
        found.sort((a, b) => b.distance - a.distance || b.id - a.id);
        if (found.length < ef || hit.distance < found[0].distance) {
          candidates.push(hit);
          found.push(hit);
          if (found.length > ef) found.shift();
        }
      }
    }
    return found.sort((a, b) => a.distance - b.distance || a.id - b.id);
  }

  insert(item: VectorItem, distance: DistanceFn) {
    const level = this.randomLevel();
    this.graph.set(item.id, { item, maxLyr: level, nbrs: Array.from({ length: level + 1 }, () => []) });
    if (this.entryPoint === -1) { this.entryPoint = item.id; this.topLayer = level; return; }
    let ep = this.entryPoint;
    for (let layer = this.topLayer; layer > level; layer -= 1) {
      const result = this.searchLayer(item.embedding, ep, 1, layer, distance);
      if (result[0]) ep = result[0].id;
    }
    for (let layer = Math.min(this.topLayer, level); layer >= 0; layer -= 1) {
      const result = this.searchLayer(item.embedding, ep, this.efBuild, layer, distance);
      const limit = layer === 0 ? 2 * this.M : this.M;
      const selected = result.slice(0, limit).map(hit => hit.id);
      this.graph.get(item.id)!.nbrs[layer] = selected;
      for (const neighborId of selected) {
        const neighbor = this.graph.get(neighborId);
        if (!neighbor) continue;
        if (!neighbor.nbrs[layer]) neighbor.nbrs[layer] = [];
        neighbor.nbrs[layer].push(item.id);
        if (neighbor.nbrs[layer].length > limit) {
          neighbor.nbrs[layer] = neighbor.nbrs[layer]
            .filter(id => this.graph.has(id))
            .map(id => ({ id, distance: distance(neighbor.item.embedding, this.graph.get(id)!.item.embedding) }))
            .sort((a, b) => a.distance - b.distance || a.id - b.id)
            .slice(0, limit).map(hit => hit.id);
        }
      }
      if (result[0]) ep = result[0].id;
    }
    if (level > this.topLayer) { this.topLayer = level; this.entryPoint = item.id; }
  }

  knn(query: number[], k: number, ef: number, distance: DistanceFn): ScoredId[] {
    if (this.entryPoint === -1 || k <= 0) return [];
    let ep = this.entryPoint;
    for (let layer = this.topLayer; layer > 0; layer -= 1) {
      const result = this.searchLayer(query, ep, 1, layer, distance);
      if (result[0]) ep = result[0].id;
    }
    return this.searchLayer(query, ep, Math.max(ef, k), 0, distance).slice(0, k);
  }

  remove(id: number) {
    if (!this.graph.has(id)) return;
    Array.from(this.graph.values()).forEach((node: Node) => {
      node.nbrs = node.nbrs.map((layer: number[]) => layer.filter((neighbor: number) => neighbor !== id));
    });
    this.graph.delete(id);
    if (this.entryPoint === id) {
      this.entryPoint = this.graph.keys().next().value ?? -1;
      if (this.entryPoint === -1) this.topLayer = -1;
    }
  }

  getInfo(): GraphInfo {
    const maxLayer = Math.max(this.topLayer + 1, 1);
    const nodesPerLayer = Array(maxLayer).fill(0);
    const edgesPerLayer = Array(maxLayer).fill(0);
    const nodes: GraphInfo["nodes"] = [];
    const edges: GraphInfo["edges"] = [];
    Array.from(this.graph.entries()).forEach(([id, node]) => {
      nodes.push({ id, metadata: node.item.metadata, category: node.item.category, maxLyr: node.maxLyr });
      for (let layer = 0; layer <= node.maxLyr && layer < maxLayer; layer += 1) {
        nodesPerLayer[layer] += 1;
        for (const neighbor of node.nbrs[layer] ?? []) if (id < neighbor) {
          edgesPerLayer[layer] += 1;
          edges.push({ src: id, dst: neighbor, lyr: layer });
        }
      }
    });
    return { topLayer: this.topLayer, nodeCount: this.graph.size, nodesPerLayer, edgesPerLayer, nodes, edges };
  }

  size() { return this.graph.size; }
}
