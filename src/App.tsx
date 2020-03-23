import React from "react";
import "./App.css";
import { Graph } from "./Graph/graph";
import { Graph as GraphOld } from "./Graph/graphOld";
import { CaseNode } from "./listToGraph/interfaces";

function App() {
  const onEdgeHover = (node: CaseNode, parent?: CaseNode) =>
    `${parent?.name} -> ${node.name}`;
  return (
    <div>
      <Graph onEdgeHover={onEdgeHover} />
      <hr />
      {/* <GraphOld /> */}
    </div>
  );
}

export default App;
