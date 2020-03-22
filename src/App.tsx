import React from "react";
import "./App.css";
import { Graph } from "./Graph/graph";
import { Graph as GraphOld } from "./Graph/graphOld";

function App() {
  return (
    <div>
      <Graph />
      <hr />
      <GraphOld />
    </div>
  );
}

export default App;
