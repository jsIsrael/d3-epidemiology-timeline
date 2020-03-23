import React from "react";
import "./App.css";
import { Graph } from "./Graph/graph";
import { Graph as GraphOld } from "./Graph/graphOld";
import { CaseNode } from "./listToGraph/interfaces";

function App() {
  const edgeHoverTooltip = (node: CaseNode, parent?: CaseNode) =>
    `${parent?.name} -> ${node.name}(id:${node.id})`;
  return (
    <div>
      <Graph
        edgeHoverTooltip={edgeHoverTooltip}
        nodeHoverTooltip={(node, parent) => {
          return `<div>
            ${node.id}<br />
            ${node.name}<br />
            ${node.gender}<br />
            ${node.date}<br />
            ${node.status}<br />
          </div>`;
        }}
      />
      <hr />
      {/* <GraphOld /> */}
    </div>
  );
}

export default App;
