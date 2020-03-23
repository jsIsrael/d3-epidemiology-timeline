/* eslint-disable no-loop-func */
import { RawEdge } from "./interfaces";

export function cleanGraph(edges: RawEdge[]) {
  const visitedEdges = new Set<RawEdge>();
  const loops: RawEdge[] = [];
  for (const edge of edges) {
    if (visitedEdges.has(edge)) {
      continue;
    }

    const currentChain = new Set<RawEdge>();
    let currentEdge: RawEdge | undefined = edge;
    while (currentEdge !== undefined && !currentChain.has(currentEdge)) {
      currentChain.add(currentEdge);
      visitedEdges.add(currentEdge);
      currentEdge = edges.find((e) => e.from.id === currentEdge!.to.id);
    }

    if (currentEdge) {
      loops.push(currentEdge);
      visitedEdges.delete(currentEdge);
    }
  }
  return { edges: Array.from(visitedEdges), loops };
}
