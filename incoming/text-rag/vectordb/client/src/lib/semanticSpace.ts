export type SemanticSpaceState = "loading" | "empty" | "ready";

export function getSemanticSpaceState(loading: boolean, itemCount: number): SemanticSpaceState {
  if (loading) return "loading";
  return itemCount > 0 ? "ready" : "empty";
}
