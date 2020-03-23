import rawNodes from "./nodes.json";
import rawEdges from "./edges.json";
import { buildGraph } from "./processor";

describe("listToGraph processor", () => {
  test("buildGraph", () => {
    // @ts-ignore
    const r = buildGraph(rawNodes, rawEdges);

    expect(r).toMatchSnapshot();
  });
});
