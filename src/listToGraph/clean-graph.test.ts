import rawEdges from "./edges.json";
import { cleanGraph } from "./clean-graph";

describe("clean-graph", () => {
  test("clean-graph", () => {
    // @ts-ignore
    const r = cleanGraph(rawEdges);

    expect(r.loops).toMatchSnapshot();
  });
});
