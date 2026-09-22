import type { DistanceFn, ScoredId, VectorItem } from "./types";

export class BruteForceIndex {
  items: VectorItem[] = [];

  insert(item: VectorItem) { this.items.push(item); }

  remove(id: number) { this.items = this.items.filter(item => item.id !== id); }

  knn(query: number[], k: number, distance: DistanceFn): ScoredId[] {
    return this.items
      .map(item => ({ distance: distance(query, item.embedding), id: item.id }))
      .sort((a, b) => a.distance - b.distance || a.id - b.id)
      .slice(0, k);
  }
}

type KDNode = { item: VectorItem; left?: KDNode; right?: KDNode };

export class KDTreeIndex {
  private root: KDNode | undefined;
  constructor(private readonly dims: number) {}

  private insertNode(node: KDNode | undefined, item: VectorItem, depth: number): KDNode {
    if (!node) return { item };
    const axis = depth % this.dims;
    if (item.embedding[axis] < node.item.embedding[axis]) node.left = this.insertNode(node.left, item, depth + 1);
    else node.right = this.insertNode(node.right, item, depth + 1);
    return node;
  }

  insert(item: VectorItem) { this.root = this.insertNode(this.root, item, 0); }

  rebuild(items: VectorItem[]) {
    this.root = undefined;
    for (const item of items) this.insert(item);
  }

  knn(query: number[], k: number, distance: DistanceFn): ScoredId[] {
    if (k <= 0) return [];
    const heap: ScoredId[] = [];
    const push = (hit: ScoredId) => {
      heap.push(hit);
      heap.sort((a, b) => b.distance - a.distance || b.id - a.id);
      if (heap.length > k) heap.shift();
    };
    const visit = (node: KDNode | undefined, depth: number) => {
      if (!node) return;
      const hit = { distance: distance(query, node.item.embedding), id: node.item.id };
      if (heap.length < k || hit.distance < heap[0].distance) push(hit);
      const axis = depth % this.dims;
      const diff = query[axis] - node.item.embedding[axis];
      const closer = diff < 0 ? node.left : node.right;
      const farther = diff < 0 ? node.right : node.left;
      visit(closer, depth + 1);
      if (heap.length < k || Math.abs(diff) < heap[0].distance) visit(farther, depth + 1);
    };
    visit(this.root, 0);
    return heap.sort((a, b) => a.distance - b.distance || a.id - b.id);
  }
}
