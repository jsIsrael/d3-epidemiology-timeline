import React from "react";
import styles from "./App.module.css";
import { Graph } from "./Graph/graph";
import { CaseNode, RawEdge, RawNode } from "./listToGraph/interfaces";
import rawNodes from "./listToGraph/nodes.json";
import rawEdges from "./listToGraph/edges.json";
import { useFetch } from "react-async";
import { useDebounce } from "./utils";

if (window.location.search.includes("specialOps")) {
  window.localStorage.setItem("specialOps", "true");
}

function App() {
  const [backendBaseURL, setBackendURL] = React.useState<string>("");
  const [nodesFile, setNodesFile] = React.useState<File>();
  const [edgesFile, setEdgesFile] = React.useState<File>();
  const backendBaseURLDebounced = useDebounce(backendBaseURL, 300);

  const { data: graphNodesFromServer } = useFetch<{ [x: string]: RawNode }>(
    `${backendBaseURLDebounced}/api/graph_nodes`,
    {},
    { json: true }
  );
  const { data: graphEdgesFromServer } = useFetch<RawEdge[]>(
    `${backendBaseURLDebounced}/api/graph_edges`,
    {},
    { json: true }
  );

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

  const useFromServer = graphNodesFromServer && graphEdgesFromServer;

  return (
    <div className={styles.wrapper}>
      <Graph
        rawEdges={useFromServer ? graphNodesFromServer : (rawEdges as any)}
        rawNodes={useFromServer ? graphEdgesFromServer : (rawNodes as any)}
        nodeToStartWith={107991}
        edgeHoverTooltip={edgeHoverTooltip}
        nodeHoverTooltip={nodeHoverTooltip}
      />
      <div
        style={{
          display:
            window.localStorage.getItem("specialOps") === "true"
              ? "block"
              : "none",
          position: "fixed",
          top: 0,
          right: 0,
          backgroundColor: "red",
        }}
      >
        <input
          type="text"
          placeholder="Backend Url"
          value={backendBaseURL}
          onChange={(e) => setBackendURL(e.target.value)}
        />
        <br />
        Nodes:{" "}
        <input
          type="file"
          name="nodes"
          onChange={(e) => setNodesFile(e.target.files![0])}
        />
        <br />
        Edges:{" "}
        <input
          type="file"
          name="edges"
          onChange={(e) => setEdgesFile(e.target.files![0])}
        />
      </div>
    </div>
  );
}

export default App;
