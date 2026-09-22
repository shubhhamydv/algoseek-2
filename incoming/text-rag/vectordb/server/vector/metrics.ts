import type { DistanceFn, DistanceMetric } from "./types";

export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const delta = a[i] - b[i];
    sum += delta * delta;
  }
  return Math.sqrt(sum);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na < 1e-9 || nb < 1e-9) return 1;
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function manhattan(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum;
}

export function getDistance(metric: string): DistanceFn {
  if (metric === "cosine") return cosine;
  if (metric === "manhattan") return manhattan;
  return euclidean;
}

export function isDistanceMetric(value: string): value is DistanceMetric {
  return value === "cosine" || value === "euclidean" || value === "manhattan";
}
