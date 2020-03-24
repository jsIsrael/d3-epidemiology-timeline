import React from "react";
import styles from "./App.module.css";
import { Graph } from "./Graph/graph";
import { CaseNode } from "./listToGraph/interfaces";
import rawNodes from "./listToGraph/nodes.json";
import rawEdges from "./listToGraph/edges.json";

function App() {
  const edgeHoverTooltip = React.useCallback(
    (node: CaseNode, parent?: CaseNode) =>
      `${parent?.name} -> ${node.name}(id:${node.id})`,
    []
  );

  const nodeHoverTooltip = React.useCallback((node, parent) => {
    return `<div>
      ${node.id}<br />
      ${node.name}<br />
      ${node.gender}<br />
      ${node.date}<br />
      ${node.status}<br />
    </div>`;
  }, []);

  return (
    <div className={styles.wrapper}>
      <Graph
        rawEdges={rawEdges as any}
        rawNodes={rawNodes as any}
        nodeToStartWith={107991}
        edgeHoverTooltip={edgeHoverTooltip}
        nodeHoverTooltip={nodeHoverTooltip}
      />
    </div>
  );
}

export default App;
